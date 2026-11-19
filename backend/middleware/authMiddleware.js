import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import getJwtSecret from '../utils/jwtSecret.js';

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const bearerToken = authorization && authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : null;
  const token = req.cookies?.token || bearerToken;

  if (!token) {
    return next(new ApiError(401, 'Unauthorized access'));
  }

  let secret;
  try {
    secret = getJwtSecret();
  } catch (error) {
    return next(error);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  try {
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'User not found or account is inactive'));
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export default authMiddleware;
