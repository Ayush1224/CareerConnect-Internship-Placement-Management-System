import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Interview from '../models/Interview.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

const createTransaction = async (operation) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

const findCompany = (userId, session) => Company.findOne({ userId })
  .select('_id companyName')
  .session(session);

const findJobTitle = async (application, session) => {
  const job = await Job.findById(application.jobId).select('title').session(session);
  return job?.title || 'your application';
};

const findReplay = async (dedupeKey, companyId, session = null) => {
  let notificationQuery = Notification.findOne({ dedupeKey }).select('interviewId');
  if (session) notificationQuery = notificationQuery.session(session);
  const notification = await notificationQuery;
  if (!notification) return null;
  if (!notification.interviewId) {
    throw new ApiError(409, 'This idempotency key has already been used');
  }

  let interviewQuery = Interview.findOne({
    _id: notification.interviewId,
    companyId
  });
  if (session) interviewQuery = interviewQuery.session(session);
  const interview = await interviewQuery;
  if (!interview) {
    throw new ApiError(409, 'This idempotency key has already been used');
  }
  return interview;
};

const findReplayAfterDuplicate = async (error, dedupeKey, companyId) => {
  if (error?.code !== 11000) return null;
  return findReplay(dedupeKey, companyId);
};

const createInterviewNotification = async ({
  session,
  interview,
  title,
  event,
  dedupeKey
}) => {
  const messages = {
    scheduled: `An interview for ${title} has been scheduled.`,
    rescheduled: `An interview for ${title} has been rescheduled.`,
    cancelled: `The interview for ${title} has been cancelled.`
  };
  await Notification.create([{
    userId: interview.studentId,
    interviewId: interview._id,
    dedupeKey,
    title: `Interview ${event}`,
    message: messages[event],
    type: 'Interview',
    isRead: false
  }], { session });
};

const scheduleKey = (companyId, requestKey) => `interview:schedule:${companyId}:${requestKey}`;
const updateKey = (interviewId, action, requestKey) => `interview:${interviewId}:${action}:${requestKey}`;

export const listStudentInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ studentId: req.user._id })
      .select('_id applicationId companyId scheduledAt meetingLink status')
      .populate({
        path: 'applicationId',
        select: 'jobId',
        populate: { path: 'jobId', select: 'title' }
      })
      .populate({ path: 'companyId', select: 'companyName' })
      .sort({ scheduledAt: 1 });
    const results = interviews.map((interview) => ({
      _id: interview._id,
      jobTitle: interview.applicationId?.jobId?.title || 'Job no longer available',
      company: interview.companyId?.companyName || 'Company',
      scheduledAt: interview.scheduledAt,
      meetingLink: interview.meetingLink,
      status: interview.status
    }));
    return res.status(200).json({ success: true, data: { interviews: results } });
  } catch (error) {
    return next(error);
  }
};

export const listCompanyInterviews = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id }).select('_id');
    const application = company && await Application.findOne({
      _id: req.params.applicationId,
      companyId: company._id
    }).select('_id');
    if (!application) return next(new ApiError(404, 'Application not found'));

    const interviews = await Interview.find({
      applicationId: application._id,
      companyId: company._id
    })
      .select('_id scheduledAt meetingLink notes status')
      .sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: { interviews } });
  } catch (error) {
    return next(error);
  }
};

export const getInterview = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new ApiError(404, 'Interview not found'));
    }

    const ownership = { _id: req.params.id };
    if (req.user.role === 'student') {
      ownership.studentId = req.user._id;
    } else {
      const company = await Company.findOne({ userId: req.user._id }).select('_id');
      if (!company) return next(new ApiError(404, 'Interview not found'));
      ownership.companyId = company._id;
    }
    const interview = await Interview.findOne(ownership)
      .select('_id applicationId studentId companyId scheduledAt meetingLink notes status');
    if (!interview) return next(new ApiError(404, 'Interview not found'));

    const result = {
      _id: interview._id,
      applicationId: interview.applicationId,
      scheduledAt: interview.scheduledAt,
      meetingLink: interview.meetingLink,
      status: interview.status
    };
    if (req.user.role === 'company') result.notes = interview.notes;
    return res.status(200).json({ success: true, data: { interview: result } });
  } catch (error) {
    return next(error);
  }
};

export const scheduleInterview = async (req, res, next) => {
  const requestKey = req.get('Idempotency-Key');
  let companyId;
  let dedupeKey;
  try {
    const result = await createTransaction(async (session) => {
      const company = await findCompany(req.user._id, session);
      if (!company) throw new ApiError(404, 'Company profile not found');
      companyId = company._id;
      dedupeKey = scheduleKey(company._id, requestKey);
      const replay = await findReplay(dedupeKey, company._id, session);
      if (replay) return { interview: replay, replay: true };

      const application = await Application.findOne({
        _id: req.body.applicationId,
        companyId: company._id
      }).session(session);
      if (!application) throw new ApiError(404, 'Application not found');
      if (application.status !== 'Shortlisted') {
        throw new ApiError(409, 'Only shortlisted applicants can be scheduled for an interview');
      }

      const interview = new Interview({
        applicationId: application._id,
        studentId: application.studentId,
        companyId: company._id,
        scheduledAt: new Date(req.body.scheduledAt),
        meetingLink: req.body.meetingLink || '',
        notes: req.body.notes || '',
        status: 'Scheduled'
      });
      await interview.save({ session });
      const jobTitle = await findJobTitle(application, session);
      await createInterviewNotification({
        session,
        interview,
        title: jobTitle,
        event: 'scheduled',
        dedupeKey
      });
      return { interview, replay: false };
    });

    return res.status(result.replay ? 200 : 201).json({
      success: true,
      message: result.replay ? 'Interview already scheduled' : 'Interview scheduled successfully',
      data: { interview: result.interview }
    });
  } catch (error) {
    if (companyId && dedupeKey) {
      try {
        const replay = await findReplayAfterDuplicate(error, dedupeKey, companyId);
        if (replay) {
          return res.status(200).json({
            success: true,
            message: 'Interview already scheduled',
            data: { interview: replay }
          });
        }
      } catch (replayError) {
        return next(replayError);
      }
    }
    return next(error);
  }
};

export const rescheduleInterview = async (req, res, next) => {
  const requestKey = req.get('Idempotency-Key');
  let companyId;
  let dedupeKey;
  try {
    const result = await createTransaction(async (session) => {
      const company = await findCompany(req.user._id, session);
      if (!company) throw new ApiError(404, 'Interview not found');
      companyId = company._id;
      dedupeKey = updateKey(req.params.id, 'reschedule', requestKey);
      const replay = await findReplay(dedupeKey, company._id, session);
      if (replay) return { interview: replay, replay: true };

      const interview = await Interview.findOne({
        _id: req.params.id,
        companyId: company._id
      }).session(session);
      if (!interview) throw new ApiError(404, 'Interview not found');
      if (interview.status !== 'Scheduled') {
        throw new ApiError(409, 'Only scheduled interviews can be rescheduled');
      }

      interview.scheduledAt = new Date(req.body.scheduledAt);
      if (req.body.meetingLink !== undefined) interview.meetingLink = req.body.meetingLink;
      if (req.body.notes !== undefined) interview.notes = req.body.notes;
      await interview.save({ session });
      const application = await Application.findById(interview.applicationId).session(session);
      const jobTitle = application ? await findJobTitle(application, session) : 'your application';
      await createInterviewNotification({
        session,
        interview,
        title: jobTitle,
        event: 'rescheduled',
        dedupeKey
      });
      return { interview, replay: false };
    });
    return res.status(200).json({
      success: true,
      message: result.replay ? 'Interview already rescheduled' : 'Interview rescheduled successfully',
      data: { interview: result.interview }
    });
  } catch (error) {
    if (companyId && dedupeKey) {
      try {
        const replay = await findReplayAfterDuplicate(error, dedupeKey, companyId);
        if (replay) {
          return res.status(200).json({
            success: true,
            message: 'Interview already rescheduled',
            data: { interview: replay }
          });
        }
      } catch (replayError) {
        return next(replayError);
      }
    }
    return next(error);
  }
};

export const cancelInterview = async (req, res, next) => {
  const requestKey = req.get('Idempotency-Key');
  let companyId;
  let dedupeKey;
  try {
    const result = await createTransaction(async (session) => {
      const company = await findCompany(req.user._id, session);
      if (!company) throw new ApiError(404, 'Interview not found');
      companyId = company._id;
      dedupeKey = updateKey(req.params.id, 'cancel', requestKey);
      const replay = await findReplay(dedupeKey, company._id, session);
      if (replay) return { interview: replay, replay: true };

      const interview = await Interview.findOne({
        _id: req.params.id,
        companyId: company._id
      }).session(session);
      if (!interview) throw new ApiError(404, 'Interview not found');
      if (interview.status === 'Completed') {
        throw new ApiError(409, 'Completed interviews cannot be cancelled');
      }
      if (interview.status !== 'Cancelled') {
        interview.status = 'Cancelled';
        await interview.save({ session });
        const application = await Application.findById(interview.applicationId).session(session);
        const jobTitle = application ? await findJobTitle(application, session) : 'your application';
        await createInterviewNotification({
          session,
          interview,
          title: jobTitle,
          event: 'cancelled',
          dedupeKey
        });
      }
      return { interview, replay: false };
    });
    return res.status(200).json({
      success: true,
      message: result.replay ? 'Interview already cancelled' : 'Interview cancelled successfully',
      data: { interview: result.interview }
    });
  } catch (error) {
    if (companyId && dedupeKey) {
      try {
        const replay = await findReplayAfterDuplicate(error, dedupeKey, companyId);
        if (replay) {
          return res.status(200).json({
            success: true,
            message: 'Interview already cancelled',
            data: { interview: replay }
          });
        }
      } catch (replayError) {
        return next(replayError);
      }
    }
    return next(error);
  }
};

export const completeInterview = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id }).select('_id');
    if (!company) return next(new ApiError(404, 'Interview not found'));
    const interview = await Interview.findOne({
      _id: req.params.id,
      companyId: company._id
    });
    if (!interview) return next(new ApiError(404, 'Interview not found'));
    if (interview.status === 'Cancelled') {
      return next(new ApiError(409, 'Cancelled interviews cannot be completed'));
    }
    if (interview.status !== 'Completed') {
      interview.status = 'Completed';
      await interview.save();
    }
    return res.status(200).json({
      success: true,
      message: 'Interview marked completed',
      data: { interview }
    });
  } catch (error) {
    return next(error);
  }
};
