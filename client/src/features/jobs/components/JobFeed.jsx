import JobCard from './JobCard';

function JobCardSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <div className="skeleton h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function JobFeed({ jobs, loading, loadingMore, hasMore, loadMore, onSaveChange }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-gray-500">
        No jobs found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} onSaveChange={onSaveChange} />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button type="button" onClick={loadMore} disabled={loadingMore} className="btn-ghost">
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
