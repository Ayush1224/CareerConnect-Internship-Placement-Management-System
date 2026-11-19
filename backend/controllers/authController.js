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
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email, isActive: true }).select('_id email');

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      const update = await User.updateOne(
        { _id: user._id, isActive: true },
        { $set: { passwordResetToken: resetTokenHash, passwordResetExpires } }
      );

      if (update.matchedCount) {
        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
        const resetLink = `${clientUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
        try {
          await sendEmail({
            to: user.email,
            subject: 'CareerConnect Password Reset',
            text: `Use the following link to reset your password: ${resetLink}`
          });
        } catch {
          console.error('Password reset email delivery failed.');
          try {
            await User.updateOne(
              { _id: user._id, passwordResetToken: resetTokenHash },
              { $unset: { passwordResetToken: 1, passwordResetExpires: 1 } }
            );
          } catch {
            console.error('Failed to clear a password reset token after email delivery failure.');
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists for that email, password reset instructions will be sent.'
    });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOneAndUpdate(
      {
        passwordResetToken,
        passwordResetExpires: { $gt: new Date() },
        isActive: true
      },
      {
        $set: { password: await bcrypt.hash(password, 10) },
        $unset: { passwordResetToken: 1, passwordResetExpires: 1 }
      },
      { runValidators: true }
    );

    if (!user) {
      return next(new ApiError(400, 'Invalid or expired reset token'));
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    return next(error);
  }
};
