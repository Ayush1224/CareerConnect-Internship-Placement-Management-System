import crypto from 'node:crypto';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const profileDefaults = {
  profileImage: '',
  college: '',
  degree: '',
  branch: '',
  graduationYear: null,
  skills: [],
  resume: '',
  github: '',
  linkedin: '',
  portfolio: '',
  bio: '',
  location: ''
};

const profileFields = Object.keys(profileDefaults);

const imageFormats = {
  'image/jpeg': {
    format: 'jpg',
    matches: (buffer) => buffer.length >= 3
      && buffer[0] === 0xff
      && buffer[1] === 0xd8
      && buffer[2] === 0xff
  },
  'image/png': {
    format: 'png',
    matches: (buffer) => buffer.length >= 8
      && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  },
  'image/webp': {
    format: 'webp',
    matches: (buffer) => buffer.length >= 12
      && buffer.toString('ascii', 0, 4) === 'RIFF'
      && buffer.toString('ascii', 8, 12) === 'WEBP'
  }
};

const serializeProfile = (user, profile) => ({
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  ...Object.fromEntries(
    profileFields.map((field) => [
      field,
      profile?.[field] ?? profileDefaults[field]
    ])
  )
});

const assertValidFileSignature = (file, kind) => {
  if (kind === 'resume') {
    if (file.mimetype !== 'application/pdf' || file.buffer.toString('ascii', 0, 5) !== '%PDF-') {
      throw new ApiError(400, 'Upload a valid PDF file');
    }
    return null;
  }

  const imageFormat = imageFormats[file.mimetype];
  if (!imageFormat || !imageFormat.matches(file.buffer)) {
    throw new ApiError(400, 'Upload a valid JPEG, PNG, or WebP image');
  }
  return imageFormat.format;
};

const isCloudinaryConfigured = () => {
  const { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret } = cloudinary.config();
  return Boolean(cloudName && apiKey && apiSecret);
};

const uploadToCloudinary = (buffer, options) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error || !result) {
      console.error('Cloudinary profile file upload failed.');
      reject(new ApiError(502, 'File storage could not complete the upload'));
      return;
    }
    if (!result.public_id || !result.secure_url) {
      console.error('Cloudinary returned an incomplete profile file result.');
      reject(new ApiError(502, 'File storage returned an invalid upload result'));
      return;
    }
    resolve(result);
  });
  stream.end(buffer);
});

const destroyCloudinaryAsset = async (publicId, resourceType) => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true
  });
  if (result?.result === 'error') throw new Error('Cloudinary asset deletion failed');
};

const removeUploadedAssetAfterFailure = async (asset, resourceType) => {
  if (!asset?.public_id) return;
  try {
    await destroyCloudinaryAsset(asset.public_id, resourceType);
  } catch {
    console.error('Could not clean up an unpersisted Cloudinary profile file.');
  }
};

const getManagedPublicId = (url, kind, userId) => {
  if (!url || !isCloudinaryConfigured()) return null;

  try {
    const parsedUrl = new URL(url);
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const cloudName = cloudinary.config().cloud_name;
    const resourceType = kind === 'resume' ? 'raw' : 'image';
    const folder = kind === 'resume' ? 'student-resumes' : 'student-profile-images';

    if (
      parsedUrl.protocol !== 'https:'
      || parsedUrl.hostname !== 'res.cloudinary.com'
      || segments[0] !== cloudName
      || segments[1] !== resourceType
      || segments[2] !== 'upload'
    ) {
      return null;
    }

    const assetPath = segments.slice(3);
    if (/^v\d+$/.test(assetPath[0] || '')) assetPath.shift();
    let publicId = assetPath.join('/');
    const expectedPrefix = `careerconnect/${folder}/${userId}/`;
    if (!publicId.startsWith(expectedPrefix)) return null;

    if (kind === 'resume') {
      return publicId.endsWith('.pdf') ? publicId : null;
    }
    if (!/\.(?:jpg|jpeg|png|webp)$/i.test(publicId)) return null;
    publicId = publicId.replace(/\.(?:jpg|jpeg|png|webp)$/i, '');
    return publicId;
  } catch {
    return null;
  }
};

const persistProfileFile = async (userId, field, secureUrl) => {
  const existingProfile = await StudentProfile.findOne({ userId }).select(field).lean();
  if (!existingProfile) {
    const profile = await StudentProfile.create({ userId, [field]: secureUrl });
    return { profile, previousUrl: '' };
  }

  const previousUrl = existingProfile[field] ?? '';
  const filter = { userId };
  if (existingProfile[field] === undefined || existingProfile[field] === null) {
    filter.$or = [{ [field]: { $exists: false } }, { [field]: null }];
  } else {
    filter[field] = existingProfile[field];
  }

  const profile = await StudentProfile.findOneAndUpdate(
    filter,
    { $set: { [field]: secureUrl } },
    { new: true, runValidators: true }
  );
  if (!profile) {
    throw new ApiError(409, 'The profile file changed during upload. Please try again.');
  }
  return { profile, previousUrl };
};

const uploadStudentFile = (kind) => async (req, res, next) => {
  let asset;
  const resourceType = kind === 'resume' ? 'raw' : 'image';
  const field = kind === 'resume' ? 'resume' : 'profileImage';

  try {
    if (!req.file) throw new ApiError(400, 'A file is required');
    const format = assertValidFileSignature(req.file, kind);
    if (!isCloudinaryConfigured()) {
      throw new ApiError(503, 'File uploads are not configured');
    }

    const userId = req.user._id.toString();
    const folder = kind === 'resume' ? 'student-resumes' : 'student-profile-images';
    const options = {
      public_id: `careerconnect/${folder}/${userId}/${crypto.randomUUID()}${kind === 'resume' ? '.pdf' : ''}`,
      resource_type: resourceType,
      overwrite: false,
      unique_filename: false,
      ...(format ? { format, allowed_formats: [format] } : {})
    };

    asset = await uploadToCloudinary(req.file.buffer, options);

    let persisted;
    try {
      persisted = await persistProfileFile(req.user._id, field, asset.secure_url);
    } catch (error) {
      await removeUploadedAssetAfterFailure(asset, resourceType);
      if (error.code === 11000) {
        return next(new ApiError(409, 'The profile file changed during upload. Please try again.'));
      }
      return next(error);
    }

    let cleanupFailed = false;
    const oldPublicId = getManagedPublicId(persisted.previousUrl, kind, userId);
    if (oldPublicId && oldPublicId !== asset.public_id) {
      try {
        await destroyCloudinaryAsset(oldPublicId, resourceType);
      } catch {
        cleanupFailed = true;
        console.error('Could not remove the replaced Cloudinary profile file.');
      }
    }

    const label = kind === 'resume' ? 'Resume' : 'Profile image';
    return res.status(200).json({
      success: true,
      message: cleanupFailed
        ? `${label} uploaded, but the previous file could not be removed`
        : `${label} uploaded successfully`,
      data: { profile: serializeProfile(req.user, persisted.profile) }
    });
  } catch (error) {
    return next(error);
  }
};

export const getStudentProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id })
      .select(profileFields.join(' '))
      .lean();

    return res.status(200).json({
      success: true,
      data: { profile: serializeProfile(req.user, profile) }
    });
  } catch (error) {
    return next(error);
  }
};

export const uploadStudentResume = uploadStudentFile('resume');
export const uploadStudentProfileImage = uploadStudentFile('image');

export const updateStudentProfile = async (req, res, next) => {
  const userUpdates = {};
  if (Object.hasOwn(req.body, 'name')) userUpdates.name = req.body.name;
  if (Object.hasOwn(req.body, 'phone')) userUpdates.phone = req.body.phone;

  const profileUpdates = Object.fromEntries(
    profileFields
      .filter((field) => Object.hasOwn(req.body, field))
      .map((field) => [field, req.body[field]])
  );

  let session;
  let updatedProfile;

  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      if (Object.keys(userUpdates).length) {
        const result = await User.updateOne(
          { _id: req.user._id },
          { $set: userUpdates },
          { runValidators: true, session }
        );
        if (result.matchedCount === 0) {
          throw new ApiError(404, 'Student account not found');
        }
      }

      updatedProfile = await StudentProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          $set: profileUpdates,
          $setOnInsert: { userId: req.user._id }
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          session
        }
      );
    });

    const updatedUser = {
      name: userUpdates.name ?? req.user.name,
      email: req.user.email,
      phone: userUpdates.phone ?? req.user.phone ?? ''
    };

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: { profile: serializeProfile(updatedUser, updatedProfile) }
    });
  } catch (error) {
    return next(error);
  } finally {
    if (session) await session.endSession();
  }
};
