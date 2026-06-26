import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';
import * as jobsApi from '../../api/jobs';
import EditJobModal from './components/EditJobModal';
import { formatPostedTime } from './utils';

function StatusBadge({ status }) {
  const isOpen = status === 'open';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
      }`}
    >
      {isOpen ? 'Open' : 'Closed'}
    </span>
  );
}

export default function MyJobPostsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await jobsApi.getMyPosts();
      setJobs(list || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load your job posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleToggleStatus = async (jobId) => {
    setBusyId(jobId);
    try {
      const { status } = await jobsApi.toggleJobStatus(jobId);
      setJobs((prev) => prev.map((job) => (job._id === jobId ? { ...job, status } : job)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (jobId) => {
    setBusyId(jobId);
    try {
      await jobsApi.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast.success('Job deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl py-6">
        <Link to="/jobs" className="mb-3 inline-block text-sm font-semibold text-brand-500 hover:underline">
          ← Back to jobs
        </Link>
        <h1 className="mb-3 font-display text-lg font-semibold text-gray-900">My Job Posts</h1>

        {loading ? (
          <p className="card p-6 text-sm text-gray-500">Loading your posts…</p>
        ) : jobs.length === 0 ? (
          <div className="card p-8 text-center text-sm text-gray-500">You haven&apos;t posted any jobs yet.</div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/jobs/${job._id}`} className="truncate font-semibold text-gray-900 hover:underline">
                      {job.title}
                    </Link>
                    <p className="truncate text-sm text-gray-500">
                      {job.companyName} · {job.location}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <StatusBadge status={job.status} />
                      <Link to={`/jobs/${job._id}/applicants`} className="font-semibold text-brand-500 hover:underline">
                        {job.applicationsCount} applicant{job.applicationsCount === 1 ? '' : 's'}
                      </Link>
                      <span>Posted {formatPostedTime(job.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 text-sm">
                  <button type="button" onClick={() => setEditingJob(job)} className="font-semibold text-brand-500 hover:underline">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(job._id)}
                    disabled={busyId === job._id}
                    className="font-semibold text-gray-600 hover:underline disabled:opacity-50"
                  >
                    {job.status === 'open' ? 'Close' : 'Reopen'}
                  </button>
                  {confirmDeleteId === job._id ? (
                    <span className="ml-auto flex items-center gap-2">
                      <span className="text-gray-600">Delete?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(job._id)}
                        disabled={busyId === job._id}
                        className="font-semibold text-red-600 hover:underline"
                      >
                        Yes
                      </button>
                      <button type="button" onClick={() => setConfirmDeleteId(null)} className="font-semibold text-gray-500 hover:underline">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(job._id)}
                      className="ml-auto font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onUpdated={(updated) => setJobs((prev) => prev.map((job) => (job._id === updated._id ? { ...job, ...updated } : job)))}
        />
      )}
    </MainLayout>
  );
}
