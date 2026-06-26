import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as jobsApi from '../../../api/jobs';
import CompanyLogo from './CompanyLogo';
import { formatPostedTime, formatSalary, jobTypeLabel, workplaceLabel } from '../utils';

function MetaBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600">
      {children}
    </span>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function JobCard({ job, onSaveChange }) {
  const [saved, setSaved] = useState(Boolean(job.isSaved));
  const [savingToggle, setSavingToggle] = useState(false);
  const salary = formatSalary(job.salaryRange);
  const isClosed = job.status === 'closed';

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (savingToggle) return;
    setSavingToggle(true);
    const previous = saved;
    setSaved(!previous);
    try {
      const { saved: nextSaved } = await jobsApi.toggleSaveJob(job._id);
      setSaved(nextSaved);
      onSaveChange?.(job._id, nextSaved);
    } catch (error) {
      setSaved(previous);
      toast.error(error.response?.data?.message || 'Failed to update saved jobs');
    } finally {
      setSavingToggle(false);
    }
  };

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="card relative block p-4 transition hover:border-brand-500/40 hover:shadow-md"
    >
      <button
        type="button"
        onClick={handleSave}
        aria-label={saved ? 'Unsave job' : 'Save job'}
        className={`absolute right-3 top-3 transition ${saved ? 'text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <BookmarkIcon filled={saved} />
      </button>

      <div className="flex gap-3 pr-8">
        <CompanyLogo logo={job.companyLogo} companyName={job.companyName} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900">{job.title}</h3>
          <p className="truncate text-sm text-gray-700">{job.companyName}</p>
          <p className="truncate text-xs text-gray-500">{job.location}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MetaBadge>{jobTypeLabel(job.jobType)}</MetaBadge>
            <MetaBadge>{workplaceLabel(job.workplace)}</MetaBadge>
            {isClosed && (
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">
                Closed
              </span>
            )}
            {job.hasApplied && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                Already applied
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
            {salary && <span>{salary}</span>}
            <span>{formatPostedTime(job.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
