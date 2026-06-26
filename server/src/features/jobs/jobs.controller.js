import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import {
  getJobs,
  createJob,
  getMyPosts,
  getSavedJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleJobStatus,
  toggleSaveJob,
  applyToJob,
  getApplicants,
  updateApplicationStatus,
  getMyApplications,
} from './jobs.service.js';

export const getJobsController = asyncHandler(async (req, res) => {
  const data = await getJobs(req.user._id, req.query);
  return sendSuccess(res, { message: 'Jobs fetched', data });
});

export const createJobController = asyncHandler(async (req, res) => {
  const job = await createJob(req.user._id, req.body);
  return sendSuccess(res, { message: 'Job posted', data: { job }, statusCode: 201 });
});

export const getMyPostsController = asyncHandler(async (req, res) => {
  const jobs = await getMyPosts(req.user._id);
  return sendSuccess(res, { message: 'My job posts fetched', data: { jobs } });
});

export const getSavedJobsController = asyncHandler(async (req, res) => {
  const jobs = await getSavedJobs(req.user._id);
  return sendSuccess(res, { message: 'Saved jobs fetched', data: { jobs } });
});

export const getMyApplicationsController = asyncHandler(async (req, res) => {
  const applications = await getMyApplications(req.user._id);
  return sendSuccess(res, { message: 'My applications fetched', data: { applications } });
});

export const getJobByIdController = asyncHandler(async (req, res) => {
  const job = await getJobById(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Job fetched', data: { job } });
});

export const updateJobController = asyncHandler(async (req, res) => {
  const job = await updateJob(req.params.id, req.user._id, req.body);
  return sendSuccess(res, { message: 'Job updated', data: { job } });
});

export const deleteJobController = asyncHandler(async (req, res) => {
  const result = await deleteJob(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Job deleted', data: result });
});

export const toggleJobStatusController = asyncHandler(async (req, res) => {
  const result = await toggleJobStatus(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Job status updated', data: result });
});

export const toggleSaveJobController = asyncHandler(async (req, res) => {
  const result = await toggleSaveJob(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Job save toggled', data: result });
});

export const applyToJobController = asyncHandler(async (req, res) => {
  const application = await applyToJob(req.params.id, req.user._id, req.body.coverLetter);
  return sendSuccess(res, { message: 'Application submitted', data: { application }, statusCode: 201 });
});

export const getApplicantsController = asyncHandler(async (req, res) => {
  const data = await getApplicants(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Applicants fetched', data });
});

export const updateApplicationStatusController = asyncHandler(async (req, res) => {
  const application = await updateApplicationStatus(
    req.params.id,
    req.params.applicationId,
    req.user._id,
    req.body.status
  );
  return sendSuccess(res, { message: 'Application status updated', data: { application } });
});
