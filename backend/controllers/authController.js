import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone = '', role = 'student' } = req.body;

    if (!['student', 'company'].includes(role)) {
      return next(new ApiError(400, 'Only student and company registrations are allowed'));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new ApiError(409, 'User already exists with this email'));
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone,
      role
    });

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, 'User already exists with this email'));
    }
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getLoggedInUser = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        isActive: req.user.isActive
      }
    }
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return next(new ApiError(404, 'No account found with this email'));
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'CareerConnect Password Reset',
      text: `Use the following link to reset your password: ${resetLink}`
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ApiError(400, 'Invalid or expired reset token'));
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};
