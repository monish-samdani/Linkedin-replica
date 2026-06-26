import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: { type: String, maxlength: 2000, default: '' },
    status: {
      type: String,
      enum: ['applied', 'viewed', 'rejected', 'accepted'],
      default: 'applied',
    },
  },
  { timestamps: true }
);

// One application per user per job.
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
