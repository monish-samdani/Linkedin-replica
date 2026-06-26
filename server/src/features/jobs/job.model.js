import mongoose from 'mongoose';

const salaryRangeSchema = new mongoose.Schema(
  {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['yearly', 'monthly', 'hourly'], default: 'yearly' },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    companyName: { type: String, required: true, trim: true, maxlength: 100 },
    companyLogo: { type: String, default: '' },
    location: { type: String, required: true, trim: true },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      required: true,
    },
    workplace: {
      type: String,
      enum: ['onsite', 'hybrid', 'remote'],
      required: true,
    },
    description: { type: String, required: true, maxlength: 5000 },
    requirements: { type: String, maxlength: 3000 },
    salaryRange: { type: salaryRangeSchema, default: () => ({}) },
    deadline: { type: Date },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    applicationsCount: { type: Number, default: 0 },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

jobSchema.index({ postedBy: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ title: 'text', companyName: 'text', location: 'text' });

const Job = mongoose.model('Job', jobSchema);

export default Job;
