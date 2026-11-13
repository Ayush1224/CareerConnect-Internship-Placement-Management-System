import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Interview from '../models/Interview.js';
import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';
import ApiError from '../utils/ApiError.js';
import { isApplicationOpen } from '../utils/jobAvailability.js';

const isDuplicateApplication = (error) => error?.code === 11000;

export const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.body.jobId).select('_id companyId status applicationDeadline');
    if (!job) {
      return next(new ApiError(404, 'Job not found'));
    }
    if (!isApplicationOpen(job)) {
      return next(new ApiError(409, 'This job is no longer accepting applications'));
    }

    const studentProfile = await StudentProfile.findOne({ userId: req.user._id }).select('resume');
    const application = await Application.create({
      studentId: req.user._id,
      jobId: job._id,
      companyId: job.companyId,
      resume: studentProfile?.resume || '',
      coverLetter: req.body.coverLetter || '',
      status: 'Applied'
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    if (isDuplicateApplication(error)) {
      return next(new ApiError(409, 'You have already applied for this job'));
    }
    return next(error);
  }
};

export const listStudentApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .select('_id jobId status appliedAt')
      .populate({
        path: 'jobId',
        select: 'title companyId',
        populate: { path: 'companyId', select: 'companyName' }
      })
      .sort({ appliedAt: -1 });

    const results = applications.map((application) => ({
      _id: application._id,
      jobId: application.jobId?._id || null,
      jobTitle: application.jobId?.title || 'Job no longer available',
      company: application.jobId?.companyId?.companyName || 'Company',
      appliedAt: application.appliedAt,
      status: application.status
    }));

    return res.status(200).json({ success: true, data: { applications: results } });
  } catch (error) {
    return next(error);
  }
};

export const getStudentApplication = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new ApiError(404, 'Application not found'));
    }
    const application = await Application.findOne({
      _id: req.params.id,
      studentId: req.user._id
    })
      .select('_id jobId resume coverLetter status appliedAt')
      .populate({
        path: 'jobId',
        select: 'title companyId',
        populate: { path: 'companyId', select: 'companyName' }
      });

    if (!application) {
      return next(new ApiError(404, 'Application not found'));
    }
    return res.status(200).json({ success: true, data: { application } });
  } catch (error) {
    return next(error);
  }
};

export const listCompanyApplicants = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.jobId)) {
      return next(new ApiError(404, 'Job not found'));
    }
    const company = await Company.findOne({ userId: req.user._id }).select('_id');
    if (!company) {
      return next(new ApiError(404, 'Job not found'));
    }
    const job = await Job.findOne({ _id: req.params.jobId, companyId: company._id })
      .select('_id title status applicationDeadline');
    if (!job) {
      return next(new ApiError(404, 'Job not found'));
    }

    const applications = await Application.find({ jobId: job._id, companyId: company._id })
      .select('_id studentId resume coverLetter status appliedAt')
      .populate({ path: 'studentId', select: 'name email' })
      .sort({ appliedAt: -1 });
    const applicationIds = applications.map((application) => application._id);
    const interviews = await Interview.find({
      applicationId: { $in: applicationIds },
      companyId: company._id
    })
      .select('_id applicationId scheduledAt meetingLink notes status')
      .sort({ createdAt: 1 });
    const interviewsByApplicationId = new Map();
    for (const interview of interviews) {
      const key = String(interview.applicationId);
      const applicationInterviews = interviewsByApplicationId.get(key) || [];
      applicationInterviews.push(interview);
      interviewsByApplicationId.set(key, applicationInterviews);
    }
    const studentIds = applications.map((application) => application.studentId?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } })
      .select('userId college degree branch graduationYear skills');
    const profilesByUserId = new Map(profiles.map((profile) => [String(profile.userId), profile]));

    const results = applications.map((application) => {
      const student = application.studentId;
      const profile = student ? profilesByUserId.get(String(student._id)) : null;
      return {
        _id: application._id,
        status: application.status,
        appliedAt: application.appliedAt,
        interviews: interviewsByApplicationId.get(String(application._id)) || [],
        resume: application.resume,
        coverLetter: application.coverLetter,
        student: student
          ? {
            _id: student._id,
            name: student.name,
            email: student.email,
            college: profile?.college || '',
            degree: profile?.degree || '',
            branch: profile?.branch || '',
            graduationYear: profile?.graduationYear ?? null,
            skills: profile?.skills || []
          }
          : null
      };
    });

    return res.status(200).json({
      success: true,
      data: { job, applications: results }
    });
  } catch (error) {
    return next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new ApiError(404, 'Application not found'));
    }
    const company = await Company.findOne({ userId: req.user._id }).select('_id');
    if (!company) {
      return next(new ApiError(404, 'Application not found'));
    }
    const application = await Application.findOne({
      _id: req.params.id,
      companyId: company._id
    });
    if (!application) {
      return next(new ApiError(404, 'Application not found'));
    }

    application.status = req.body.status;
    await application.save();
    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: { application: { _id: application._id, status: application.status } }
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return next(new ApiError(400, 'Invalid application status'));
    }
    return next(error);
  }
};
