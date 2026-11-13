import mongoose from 'mongoose';

export const APPLICATION_STATUSES = ['Applied', 'Shortlisted', 'Rejected', 'Selected'];

const applicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    resume: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'Applied'
    }
  },
  {
    timestamps: { createdAt: 'appliedAt', updatedAt: 'updatedAt' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ companyId: 1 });
applicationSchema.virtual('interviews', {
  ref: 'Interview',
  localField: '_id',
  foreignField: 'applicationId'
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
