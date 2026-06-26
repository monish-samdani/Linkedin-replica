import api from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const getJobs = async (params = {}) => {
  const { data } = await api.get(ENDPOINTS.JOBS.BASE, { params });
  return data.data;
};

export const getJobById = async (id) => {
  const { data } = await api.get(ENDPOINTS.JOBS.BY_ID(id));
  return data.data.job;
};

export const createJob = async (payload) => {
  const { data } = await api.post(ENDPOINTS.JOBS.BASE, payload);
  return data.data.job;
};

export const updateJob = async (id, payload) => {
  const { data } = await api.patch(ENDPOINTS.JOBS.BY_ID(id), payload);
  return data.data.job;
};

export const deleteJob = async (id) => {
  const { data } = await api.delete(ENDPOINTS.JOBS.BY_ID(id));
  return data.data;
};

export const toggleJobStatus = async (id) => {
  const { data } = await api.patch(ENDPOINTS.JOBS.CLOSE(id));
  return data.data;
};

export const toggleSaveJob = async (id) => {
  const { data } = await api.patch(ENDPOINTS.JOBS.SAVE(id));
  return data.data;
};

export const applyToJob = async (id, coverLetter = '') => {
  const { data } = await api.post(ENDPOINTS.JOBS.APPLY(id), { coverLetter });
  return data.data.application;
};

export const getApplicants = async (id) => {
  const { data } = await api.get(ENDPOINTS.JOBS.APPLICANTS(id));
  return data.data;
};

export const updateApplicationStatus = async (id, applicationId, status) => {
  const { data } = await api.patch(ENDPOINTS.JOBS.APPLICATION_STATUS(id, applicationId), { status });
  return data.data.application;
};

export const getMyApplications = async () => {
  const { data } = await api.get(ENDPOINTS.JOBS.MY_APPLICATIONS);
  return data.data.applications;
};

export const getMyPosts = async () => {
  const { data } = await api.get(ENDPOINTS.JOBS.MY_POSTS);
  return data.data.jobs;
};

export const getSavedJobs = async () => {
  const { data } = await api.get(ENDPOINTS.JOBS.SAVED);
  return data.data.jobs;
};
