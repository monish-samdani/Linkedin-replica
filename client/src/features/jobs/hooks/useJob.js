import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as jobsApi from '../../../api/jobs';

// Loads a single job and exposes apply / save-toggle actions that keep local state in sync.
export function useJob(jobId) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await jobsApi.getJobById(jobId);
      setJob(data);
    } catch (err) {
      setError(true);
      toast.error(err.response?.data?.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId, fetchJob]);

  const apply = useCallback(
    async (coverLetter) => {
      const application = await jobsApi.applyToJob(jobId, coverLetter);
      setJob((prev) =>
        prev ? { ...prev, hasApplied: true, applicationStatus: application.status } : prev
      );
      return application;
    },
    [jobId]
  );

  const toggleSave = useCallback(async () => {
    const previous = job?.isSaved;
    setJob((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : prev));
    try {
      const { saved } = await jobsApi.toggleSaveJob(jobId);
      setJob((prev) => (prev ? { ...prev, isSaved: saved } : prev));
    } catch (err) {
      setJob((prev) => (prev ? { ...prev, isSaved: previous } : prev));
      toast.error(err.response?.data?.message || 'Failed to update saved jobs');
    }
  }, [jobId, job?.isSaved]);

  return { job, loading, error, apply, toggleSave, refetch: fetchJob, setJob };
}
