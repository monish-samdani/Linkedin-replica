import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';
import * as jobsApi from '../../api/jobs';
import JobCard from './components/JobCard';

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    try {
      const list = await jobsApi.getSavedJobs();
      setJobs(list || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  // Drop a job from the list as soon as it's unsaved here.
  const handleSaveChange = (jobId, saved) => {
    if (!saved) setJobs((prev) => prev.filter((job) => job._id !== jobId));
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl py-6">
        <Link to="/jobs" className="mb-3 inline-block text-sm font-semibold text-brand-500 hover:underline">
          ← Back to jobs
        </Link>
        <h1 className="mb-3 font-display text-lg font-semibold text-gray-900">Saved Jobs</h1>

        {loading ? (
          <p className="card p-6 text-sm text-gray-500">Loading saved jobs…</p>
        ) : jobs.length === 0 ? (
          <div className="card p-8 text-center text-sm text-gray-500">No saved jobs yet.</div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} onSaveChange={handleSaveChange} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
