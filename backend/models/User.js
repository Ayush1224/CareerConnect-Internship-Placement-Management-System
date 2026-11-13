import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailPattern, 'Please provide a valid email address']
    },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: ['student', 'company', 'admin'],
      required: true,
      default: 'student'
    },
    isActive: { type: Boolean, default: true },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual('studentProfile', {
  ref: 'StudentProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});
userSchema.virtual('companyProfile', {
  ref: 'Company',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});
userSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'studentId'
});
userSchema.virtual('savedJobs', {
  ref: 'SavedJob',
  localField: '_id',
  foreignField: 'studentId'
});
userSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.pre('save', async function () {
  if (!this.isModified('password') || /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(this.password)) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const removeSensitiveFields = (_document, value) => {
  delete value.password;
  delete value.passwordResetToken;
  delete value.passwordResetExpires;
  return value;
};
userSchema.set('toJSON', { virtuals: true, transform: removeSensitiveFields });
userSchema.set('toObject', { virtuals: true, transform: removeSensitiveFields });

const User = mongoose.model('User', userSchema);
export default User;
