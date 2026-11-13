import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }
  },
  { timestamps: { createdAt: 'savedAt', updatedAt: false } }
);

savedJobSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);
export default SavedJob;
