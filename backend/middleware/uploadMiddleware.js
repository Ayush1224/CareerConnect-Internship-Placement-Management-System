import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (allowedMimeTypes) => (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`), false);
};

export const uploadFields = ({ fieldName, allowedMimeTypes = [], maxSizeMb = 5 }) => {
  return multer({
    storage,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter: fileFilter(allowedMimeTypes)
  }).single(fieldName);
};
