import jwt from 'jsonwebtoken';
import getJwtSecret from './jwtSecret.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

export default generateToken;
