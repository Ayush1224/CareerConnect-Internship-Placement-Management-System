import mongoose from 'mongoose';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const companySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    industry: { type: String, default: '' },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
      validate: {
        validator: (value) => !value || emailPattern.test(value),
        message: 'Please provide a valid contact email address'
      }
    },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

companySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'companyId'
});

const Company = mongoose.model('Company', companySchema);
export default Company;
