import mongoose from 'mongoose';

export const INTERVIEW_STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

const interviewSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    scheduledAt: {
      type: Date,
      required: true,
      validate: (value) => value instanceof Date && Number.isFinite(value.getTime())
    },
    meetingLink: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: INTERVIEW_STATUSES, default: 'Scheduled' }
  },
  { timestamps: true }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
