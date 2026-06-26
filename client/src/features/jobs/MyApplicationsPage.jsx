import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useMyApplications } from './hooks/useMyApplications';
import ApplicationStatusChip from './components/ApplicationStatusChip';
import { formatPostedTime } from './utils';

export default function MyApplicationsPage() {
  const { applications, loading } = useMyApplications();

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl py-6">
        <Link to="/jobs" className="mb-3 inline-block text-sm font-semibold text-brand-500 hover:underline">
          ← Back to jobs
        </Link>
        <section className="card">
          <div className="border-b border-gray-200 px-4 py-3">
            <h1 className="font-display text-lg font-semibold text-gray-900">My Applications</h1>
          </div>

          {loading ? (
            <p className="px-4 py-6 text-sm text-gray-500">Loading applications…</p>
          ) : applications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500">You haven&apos;t applied to any jobs yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {applications.map((application) => {
                const job = application.job;
                return (
                  <li key={application._id} className="px-4 py-3">
                    {job ? (
                      <Link to={`/jobs/${job._id}`} className="block transition hover:opacity-80">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{job.title}</p>
                            <p className="truncate text-xs text-gray-500">
                              {job.companyName} · {job.location}
                            </p>
                          </div>
                          <ApplicationStatusChip status={application.status} />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Applied {formatPostedTime(application.createdAt)}</p>
                      </Link>
                    ) : (
                      <p className="text-sm text-gray-400">This job is no longer available.</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
