import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: String, default: '' },
    skillsRequired: [{ type: String, trim: true }],
    jobType: {
      type: String,
      enum: ['Internship', 'Full-time', 'Part-time'],
      required: true,
      default: 'Internship'
    },
    location: { type: String, trim: true, default: '' },
    salary: { type: Number, min: 0 },
    stipend: { type: Number, min: 0 },
    experience: { type: String, default: '' },
    vacancies: { type: Number, min: 1 },
    applicationDeadline: { type: Date },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active'
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });
jobSchema.index({ status: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ companyId: 1 });
jobSchema.index({ companyId: 1, status: 1 });

jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'jobId'
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
