import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';
import * as jobsApi from '../../api/jobs';
import { formatDate, getInitials } from './utils';

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', selectable: false },
  { value: 'viewed', label: 'Viewed', selectable: true },
  { value: 'rejected', label: 'Rejected', selectable: true },
  { value: 'accepted', label: 'Accepted', selectable: true },
];

function ApplicantRow({ jobId, application, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const applicant = application.applicant || {};

  const handleChange = async (e) => {
    const status = e.target.value;
    setUpdating(true);
    try {
      await jobsApi.updateApplicationStatus(jobId, application._id, status);
      onStatusChange(application._id, status);
      toast.success('Application status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {applicant.profilePhoto ? (
            <img src={applicant.profilePhoto} alt="" className="avatar h-11 w-11" />
          ) : (
            <div className="avatar flex h-11 w-11 items-center justify-center bg-brand-500 text-sm font-bold text-white">
              {getInitials(applicant.name)}
            </div>
          )}
          <div className="min-w-0">
            <Link to={`/in/${applicant._id}`} className="truncate text-sm font-semibold text-gray-900 hover:underline">
              {applicant.name}
            </Link>
            {applicant.headline && <p className="truncate text-xs text-gray-500">{applicant.headline}</p>}
            {(applicant.currentPosition || applicant.location) && (
              <p className="truncate text-xs text-gray-400">
                {[applicant.currentPosition, applicant.location].filter(Boolean).join(' · ')}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">Applied {formatDate(application.createdAt)}</p>
          </div>
        </div>

        <select
          value={application.status}
          onChange={handleChange}
          disabled={updating}
          aria-label="Application status"
          className="input w-auto shrink-0 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={!opt.selectable && opt.value !== application.status}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {application.coverLetter && (
        <div className="mt-2 rounded-lg bg-gray-50 p-3">
          <p className={`whitespace-pre-wrap text-sm text-gray-700 ${expanded ? '' : 'line-clamp-3'}`}>
            {application.coverLetter}
          </p>
          {application.coverLetter.length > 180 && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-1 text-xs font-semibold text-brand-500 hover:underline"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export default function ApplicantsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const result = await jobsApi.getApplicants(id);
      setData(result);
    } catch (error) {
      // 403 (not the poster) or 404 — bounce back to the job.
      toast.error(error.response?.data?.message || 'Unable to view applicants');
      navigate(`/jobs/${id}`, { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleStatusChange = (applicationId, status) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            applications: prev.applications.map((a) => (a._id === applicationId ? { ...a, status } : a)),
          }
        : prev
    );
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl py-6">
        <Link to={`/jobs/${id}`} className="mb-3 inline-block text-sm font-semibold text-brand-500 hover:underline">
          ← Back to job
        </Link>

        <section className="card">
          <div className="border-b border-gray-200 px-4 py-3">
            <h1 className="font-display text-lg font-semibold text-gray-900">Applicants</h1>
            {data?.job && (
              <p className="text-sm text-gray-500">
                {data.job.title} · {data.job.companyName}
              </p>
            )}
          </div>

          {loading ? (
            <p className="px-4 py-6 text-sm text-gray-500">Loading applicants…</p>
          ) : !data || data.applications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500">No applicants yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.applications.map((application) => (
                <ApplicantRow
                  key={application._id}
                  jobId={id}
                  application={application}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
