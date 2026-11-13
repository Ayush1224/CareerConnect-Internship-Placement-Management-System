import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Interview from '../models/Interview.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { publicJobFilter } from '../utils/jobAvailability.js';

const companyFields = '_id companyName industry location verified';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const [students, companies, activeJobs, applications, upcomingInterviews] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Company.countDocuments({}),
      Job.countDocuments(publicJobFilter(now)),
      Application.countDocuments({}),
      Interview.countDocuments({ status: 'Scheduled', scheduledAt: { $gt: now } })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        counts: { students, companies, activeJobs, applications, upcomingInterviews }
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const listCompanies = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const filter = {};
    if (req.query.verified === 'true') filter.verified = true;
    if (req.query.verified === 'false') filter.verified = false;

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .select(companyFields)
        .sort({ companyName: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Company.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        companies: companies.map((company) => ({
          _id: company._id,
          companyName: company.companyName,
          industry: company.industry,
          location: company.location,
          verified: company.verified
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const setCompanyVerification = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new ApiError(404, 'Company not found'));
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: { verified: req.body.verified } },
      { new: true, runValidators: true }
    ).select(companyFields);
    if (!company) return next(new ApiError(404, 'Company not found'));

    const verified = company.verified;
    return res.status(200).json({
      success: true,
      message: verified ? 'Company verified successfully' : 'Company verification revoked',
      data: {
        company: {
          _id: company._id,
          companyName: company.companyName,
          industry: company.industry,
          location: company.location,
          verified
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};
