import Company from '../models/Company.js';
import ApiError from '../utils/ApiError.js';

export const getMyCompanyProfile = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    res.status(200).json({ success: true, data: { company } });
  } catch (error) {
    next(error);
  }
};

export const saveMyCompanyProfile = async (req, res, next) => {
  try {
    const { companyName, website = '', industry = '', location = '', description = '', contactEmail = '' } = req.body;
    const company = await Company.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: { companyName, website, industry, location, description, contactEmail },
        $setOnInsert: { userId: req.user._id }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({
      success: true,
      message: 'Company profile saved',
      data: { company }
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, 'A company profile already exists for this account'));
    }
    next(error);
  }
};
