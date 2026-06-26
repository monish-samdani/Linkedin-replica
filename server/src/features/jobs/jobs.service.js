import Job from './job.model.js';
import Application from './application.model.js';
import AppError from '../../utils/AppError.js';
import { createNotification } from '../notifications/notifications.service.js';

const POSTER_FIELDS = 'name profilePhoto headline';
const APPLICANT_FIELDS = 'name profilePhoto headline currentPosition location';

// Fields a poster is allowed to set/edit on a job. Keeps server-managed fields
// (postedBy, status, applicationsCount, savedBy) out of client-controlled writes.
const EDITABLE_FIELDS = [
  'title',
  'companyName',
  'companyLogo',
  'location',
  'jobType',
  'workplace',
  'description',
  'requirements',
  'salaryRange',
  'deadline',
];

// Escape regex special characters so user input is treated as a literal substring.
const toRegex = (value) => new RegExp(value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

const pickEditableFields = (body) =>
  EDITABLE_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});

// Returns the set of job ids (as strings) the user has applied to, from a list of jobs.
const getAppliedJobIdSet = async (userId, jobIds) => {
  if (jobIds.length === 0) return new Set();
  const applications = await Application.find({
    applicant: userId,
    job: { $in: jobIds },
  })
    .select('job')
    .lean();
  return new Set(applications.map((a) => String(a.job)));
};

// Decorates a lean job doc with the viewer-specific isSaved / hasApplied flags.
const decorateJob = (job, userId, appliedSet) => ({
  ...job,
  isSaved: (job.savedBy || []).some((id) => String(id) === String(userId)),
  hasApplied: appliedSet.has(String(job._id)),
});

const findJobOr404 = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);
  return job;
};

const assertOwner = (job, userId) => {
  if (String(job.postedBy) !== String(userId)) {
    throw new AppError('You are not authorized to manage this job', 403);
  }
};

export const getJobs = async (userId, { page = 1, limit = 10, search, jobType, workplace, location } = {}) => {
  const safeLimit = Math.min(Number(limit) || 10, 50);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const filter = { status: 'open' };
  if (jobType) filter.jobType = jobType;
  if (workplace) filter.workplace = workplace;
  if (location) filter.location = toRegex(location);
  if (search) {
    const regex = toRegex(search);
    filter.$or = [{ title: regex }, { companyName: regex }, { location: regex }];
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('postedBy', POSTER_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  const appliedSet = await getAppliedJobIdSet(userId, jobs.map((j) => j._id));

  return {
    jobs: jobs.map((job) => decorateJob(job, userId, appliedSet)),
    page: safePage,
    hasMore: skip + jobs.length < total,
    total,
  };
};

export const createJob = async (userId, body) => {
  const job = await Job.create({ ...pickEditableFields(body), postedBy: userId });
  return Job.findById(job._id).populate('postedBy', POSTER_FIELDS).lean();
};

export const getMyPosts = async (userId) => {
  return Job.find({ postedBy: userId }).sort({ createdAt: -1 }).lean();
};

export const getSavedJobs = async (userId) => {
  const jobs = await Job.find({ savedBy: userId, status: 'open' })
    .populate('postedBy', POSTER_FIELDS)
    .sort({ createdAt: -1 })
    .lean();

  const appliedSet = await getAppliedJobIdSet(userId, jobs.map((j) => j._id));
  return jobs.map((job) => decorateJob(job, userId, appliedSet));
};

export const getJobById = async (jobId, userId) => {
  const job = await Job.findById(jobId).populate('postedBy', POSTER_FIELDS).lean();
  if (!job) throw new AppError('Job not found', 404);

  const application = await Application.findOne({ job: jobId, applicant: userId })
    .select('status')
    .lean();

  return {
    ...job,
    isSaved: (job.savedBy || []).some((id) => String(id) === String(userId)),
    hasApplied: Boolean(application),
    applicationStatus: application ? application.status : null,
  };
};

export const updateJob = async (jobId, userId, body) => {
  const job = await findJobOr404(jobId);
  assertOwner(job, userId);

  Object.assign(job, pickEditableFields(body));
  await job.save();

  return Job.findById(job._id).populate('postedBy', POSTER_FIELDS).lean();
};

export const deleteJob = async (jobId, userId) => {
  const job = await findJobOr404(jobId);
  assertOwner(job, userId);

  await Application.deleteMany({ job: jobId });
  await job.deleteOne();

  return { id: jobId };
};

export const toggleJobStatus = async (jobId, userId) => {
  const job = await findJobOr404(jobId);
  assertOwner(job, userId);

  job.status = job.status === 'open' ? 'closed' : 'open';
  await job.save();

  return { status: job.status };
};

export const toggleSaveJob = async (jobId, userId) => {
  const job = await findJobOr404(jobId);

  const alreadySaved = job.savedBy.some((id) => String(id) === String(userId));
  if (alreadySaved) {
    job.savedBy.pull(userId);
  } else {
    job.savedBy.push(userId);
  }
  await job.save();

  return { saved: !alreadySaved };
};

export const applyToJob = async (jobId, userId, coverLetter = '') => {
  const job = await findJobOr404(jobId);

  // A user applying to their own posting doesn't make sense; block it early.
  if (String(job.postedBy) === String(userId)) {
    throw new AppError('You cannot apply to your own job posting', 400);
  }
  if (job.status !== 'open') {
    throw new AppError('This job is no longer accepting applications', 403);
  }

  const existing = await Application.findOne({ job: jobId, applicant: userId }).lean();
  if (existing) throw new AppError('You have already applied to this job', 409);

  const application = await Application.create({ job: jobId, applicant: userId, coverLetter });

  job.applicationsCount += 1;
  await job.save();

  await createNotification(job.postedBy, userId, 'job_application', null, job._id);

  return application;
};

export const getApplicants = async (jobId, userId) => {
  const job = await findJobOr404(jobId);
  assertOwner(job, userId);

  const applications = await Application.find({ job: jobId })
    .populate('applicant', APPLICANT_FIELDS)
    .sort({ createdAt: -1 })
    .lean();

  return { job: { _id: job._id, title: job.title, companyName: job.companyName }, applications };
};

export const updateApplicationStatus = async (jobId, applicationId, userId, status) => {
  const job = await findJobOr404(jobId);
  assertOwner(job, userId);

  const application = await Application.findOne({ _id: applicationId, job: jobId });
  if (!application) throw new AppError('Application not found', 404);

  application.status = status;
  await application.save();

  await createNotification(application.applicant, userId, 'application_status', null, job._id);

  return application;
};

export const getMyApplications = async (userId) => {
  return Application.find({ applicant: userId })
    .populate('job', 'companyName title location status')
    .sort({ createdAt: -1 })
    .lean();
};
