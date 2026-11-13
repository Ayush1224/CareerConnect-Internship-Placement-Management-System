import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    profileImage: { type: String, default: '' },
    college: { type: String, default: '' },
    degree: { type: String, default: '' },
    branch: { type: String, default: '' },
    graduationYear: { type: Number, min: 1900, max: 2200, default: null },
    skills: [{ type: String, trim: true }],
    resume: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' }
  },
  { timestamps: true }
);

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;
