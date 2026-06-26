import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import * as jobsApi from '../../api/jobs';
import { useJob } from './hooks/useJob';
import CompanyLogo from './components/CompanyLogo';
import ApplyModal from './components/ApplyModal';
import EditJobModal from './components/EditJobModal';
import ApplicationStatusChip from './components/ApplicationStatusChip';
import { formatDate, formatPostedTime, formatSalary, getInitials, jobTypeLabel, workplaceLabel } from './utils';

function MetaBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded border border-gray-300 px-2.5 py-0.5 text-xs text-gray-600">
      {children}
    </span>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { job, loading, error, apply, toggleSave, setJob } = useJob(id);

  const [showApply, setShowApply] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-3xl py-6">
          <div className="card space-y-3 p-6">
            <div className="skeleton h-6 w-2/3" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-32 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !job) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-3xl py-6">
          <div className="card p-8 text-center text-sm text-gray-500">
            This job could not be found.
            <div className="mt-4">
              <Link to="/jobs" className="btn-ghost">
                Back to jobs
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isOwner = String(job.postedBy?._id) === String(user?._id);
  const isClosed = job.status === 'closed';
  const salary = formatSalary(job.salaryRange);

  const handleToggleStatus = async () => {
    setBusy(true);
    try {
      const { status } = await jobsApi.toggleJobStatus(job._id);
      setJob((prev) => ({ ...prev, status }));
      toast.success(status === 'open' ? 'Job reopened' : 'Job closed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job status');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await jobsApi.deleteJob(job._id);
      toast.success('Job deleted');
      navigate('/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete job');
      setBusy(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl py-6">
        <Link to="/jobs" className="mb-3 inline-block text-sm font-semibold text-brand-500 hover:underline">
          ← Back to jobs
        </Link>

        <article className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-4">
              <CompanyLogo logo={job.companyLogo} companyName={job.companyName} size="h-14 w-14" textSize="text-base" />
              <div className="min-w-0">
                <h1 className="font-display text-xl font-semibold text-gray-900">{job.title}</h1>
                <p className="text-sm text-gray-700">{job.companyName}</p>
                <p className="text-sm text-gray-500">{job.location}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSave}
              aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
              className={`shrink-0 transition ${job.isSaved ? 'text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill={job.isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <MetaBadge>{jobTypeLabel(job.jobType)}</MetaBadge>
            <MetaBadge>{workplaceLabel(job.workplace)}</MetaBadge>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isClosed ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
              }`}
            >
              {isClosed ? 'Closed' : 'Open'}
            </span>
            {job.hasApplied && <ApplicationStatusChip status={job.applicationStatus} />}
          </div>

          <div className="mt-3 space-y-1 text-sm text-gray-500">
            {salary && <p className="text-gray-700">{salary}</p>}
            <p>Posted {formatPostedTime(job.createdAt)}</p>
            {job.deadline && <p>Apply by {formatDate(job.deadline)}</p>}
          </div>

          {/* Posted-by */}
          {job.postedBy && (
            <Link
              to={`/in/${job.postedBy._id}`}
              className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50"
            >
              {job.postedBy.profilePhoto ? (
                <img src={job.postedBy.profilePhoto} alt="" className="avatar h-10 w-10" />
              ) : (
                <div className="avatar flex h-10 w-10 items-center justify-center bg-brand-500 text-xs font-bold text-white">
                  {getInitials(job.postedBy.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{job.postedBy.name}</p>
                {job.postedBy.headline && <p className="truncate text-xs text-gray-500">{job.postedBy.headline}</p>}
              </div>
            </Link>
          )}

          {/* Actions */}
          <div className="mt-5">
            {isOwner ? (
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setShowEdit(true)} className="btn-secondary">
                  Edit
                </button>
                <button type="button" onClick={handleToggleStatus} disabled={busy} className="btn-ghost border border-gray-300">
                  {isClosed ? 'Reopen' : 'Close'}
                </button>
                <Link to={`/jobs/${job._id}/applicants`} className="text-sm font-semibold text-brand-500 hover:underline">
                  {job.applicationsCount} applicant{job.applicationsCount === 1 ? '' : 's'}
                </Link>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="ml-auto text-sm font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                ) : (
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-600">Delete this job?</span>
                    <button type="button" onClick={handleDelete} disabled={busy} className="text-sm font-semibold text-red-600 hover:underline">
                      Yes
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="text-sm font-semibold text-gray-500 hover:underline">
                      No
                    </button>
                  </div>
                )}
              </div>
            ) : isClosed ? (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                This position is no longer accepting applications.
              </p>
            ) : job.hasApplied ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Your application:</span>
                <ApplicationStatusChip status={job.applicationStatus} />
              </div>
            ) : (
              <button type="button" onClick={() => setShowApply(true)} className="btn-primary w-full sm:w-auto">
                Apply now
              </button>
            )}
          </div>

          {/* Description + requirements */}
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900">About the job</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{job.description}</p>
          </section>

          {job.requirements && (
            <section className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900">Requirements</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{job.requirements}</p>
            </section>
          )}
        </article>
      </div>

      {showApply && <ApplyModal job={job} onApply={apply} onClose={() => setShowApply(false)} />}
      {showEdit && (
        <EditJobModal
          job={job}
          onClose={() => setShowEdit(false)}
          onUpdated={(updated) => setJob((prev) => ({ ...prev, ...updated }))}
        />
      )}
    </MainLayout>
  );
}
