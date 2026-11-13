import ApiError from '../utils/ApiError.js';

const roleMiddleware = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Unauthorized access'));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden access'));
  }

  next();
};

export default roleMiddleware;
