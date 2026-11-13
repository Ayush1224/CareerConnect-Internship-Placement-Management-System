import mongoose from 'mongoose';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import ApiError from '../utils/ApiError.js';
import { publicJobFilter } from '../utils/jobAvailability.js';

const normalizeDeadline = (value) => {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T23:59:59.999Z`);
  }
  return new Date(value);
};

const extractJobFields = (body) => {
  const fields = [
    'title',
    'description',
    'requirements',
    'skillsRequired',
    'jobType',
    'location',
    'salary',
    'stipend',
    'experience',
    'vacancies',
    'status'
  ];
  const jobData = {};
  for (const field of fields) {
    if (body[field] !== undefined) {
      jobData[field] = body[field];
    }
  }
  if (body.applicationDeadline !== undefined) {
    jobData.applicationDeadline = normalizeDeadline(body.applicationDeadline);
  }
  return jobData;
};

const getOwnedCompany = async (userId) => Company.findOne({ userId });

const findOwnedJob = async (jobId, companyId) => {
  if (!mongoose.isValidObjectId(jobId)) return null;
  return Job.findOne({ _id: jobId, companyId });
};

export const listPublicJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find(publicJobFilter())
      .populate({ path: 'companyId', select: 'companyName logo' })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { jobs } });
  } catch (error) {
    next(error);
  }
};

export const getPublicJob = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new ApiError(404, 'Job not found'));
    }
    const job = await Job.findOne({ _id: req.params.id, ...publicJobFilter() })
      .populate({ path: 'companyId', select: 'companyName logo' });
    if (!job) {
      return next(new ApiError(404, 'Job not found'));
    }
    res.status(200).json({ success: true, data: { job } });
  } catch (error) {
    next(error);
  }
};

export const listCompanyJobs = async (req, res, next) => {
  try {
    const company = await getOwnedCompany(req.user._id);
    if (!company) {
      return res.status(200).json({ success: true, data: { jobs: [] } });
    }
    const jobs = await Job.find({ companyId: company._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { jobs } });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const company = await getOwnedCompany(req.user._id);
    if (!company) {
      return next(new ApiError(400, 'Complete your company profile before posting a job'));
    }
    const job = await Job.create({
      ...extractJobFields(req.body),
      companyId: company._id
    });
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const company = await getOwnedCompany(req.user._id);
    if (!company) {
      return next(new ApiError(404, 'Job not found'));
    }
    const job = await findOwnedJob(req.params.id, company._id);
    if (!job) {
      return next(new ApiError(404, 'Job not found'));
    }
    Object.assign(job, extractJobFields(req.body));
    await job.save();
    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

export const closeJob = async (req, res, next) => {
  try {
    const company = await getOwnedCompany(req.user._id);
    if (!company) {
      return next(new ApiError(404, 'Job not found'));
    }
    const job = await findOwnedJob(req.params.id, company._id);
    if (!job) {
      return next(new ApiError(404, 'Job not found'));
    }
    job.status = 'Closed';
    await job.save();
    res.status(200).json({
      success: true,
      message: 'Job closed successfully',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};
