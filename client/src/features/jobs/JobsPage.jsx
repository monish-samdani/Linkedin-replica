import { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useJobs } from './hooks/useJobs';
import JobFilters from './components/JobFilters';
import JobFeed from './components/JobFeed';
import PostJobModal from './components/PostJobModal';

const SIDEBAR_LINKS = [
  { to: '/jobs/my-applications', label: 'My Applications', icon: '📄' },
  { to: '/jobs/saved', label: 'Saved Jobs', icon: '🔖' },
  { to: '/jobs/my-posts', label: 'My Job Posts', icon: '🗂️' },
];

export default function JobsPage() {
  const { jobs, loading, loadingMore, hasMore, filters, hasActiveFilters, updateFilter, clearFilters, loadMore, refetch } =
    useJobs();
  const [showPostModal, setShowPostModal] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <main className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between lg:hidden">
              <h1 className="font-display text-lg font-semibold text-gray-900">Jobs</h1>
              <button
                type="button"
                onClick={() => setShowFiltersMobile((open) => !open)}
                className="btn-ghost"
              >
                {showFiltersMobile ? 'Hide filters' : 'Filters'}
              </button>
            </div>

            <div className={`${showFiltersMobile ? 'block' : 'hidden'} lg:block`}>
              <JobFilters
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            <div className="mt-4">
              <JobFeed
                jobs={jobs}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                loadMore={loadMore}
              />
            </div>
          </main>

          <aside className="lg:col-span-1">
            <div className="card p-4 lg:sticky lg:top-20">
              <button type="button" onClick={() => setShowPostModal(true)} className="btn-primary w-full">
                Post a Job
              </button>
              <nav className="mt-4 space-y-1">
                {SIDEBAR_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>

      {showPostModal && (
        <PostJobModal onClose={() => setShowPostModal(false)} onCreated={refetch} />
      )}
    </MainLayout>
  );
}
