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
  const upload = multer({
    storage,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter: fileFilter(allowedMimeTypes)
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, (error) => {
      if (!error) return next();
      if (error instanceof multer.MulterError) {
        const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        const message = error.code === 'LIMIT_FILE_SIZE'
          ? 'File exceeds the upload size limit'
          : 'Invalid file upload';
        return next(new ApiError(statusCode, message));
      }
      return next(error);
    });
  };
};
