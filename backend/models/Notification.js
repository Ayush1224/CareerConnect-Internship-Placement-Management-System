import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    dedupeKey: { type: String },
    type: {
      type: String,
      enum: ['Application', 'Job', 'Interview', 'System'],
      default: 'System'
    },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.index(
  { dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
