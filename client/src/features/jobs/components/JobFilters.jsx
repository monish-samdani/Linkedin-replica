import { JOB_TYPES, WORKPLACES } from '../utils';

export default function JobFilters({ filters, updateFilter, clearFilters, hasActiveFilters }) {
  return (
    <div className="card p-4">
      <input
        type="search"
        value={filters.search}
        onChange={(e) => updateFilter('search', e.target.value)}
        placeholder="Search by title, company, or location"
        className="input"
      />

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          value={filters.jobType}
          onChange={(e) => updateFilter('jobType', e.target.value)}
          className="input"
          aria-label="Filter by job type"
        >
          <option value="">All types</option>
          {JOB_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.workplace}
          onChange={(e) => updateFilter('workplace', e.target.value)}
          className="input"
          aria-label="Filter by workplace"
        >
          <option value="">All workplaces</option>
          {WORKPLACES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
          placeholder="Location"
          className="input"
          aria-label="Filter by location"
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={clearFilters} className="text-sm font-semibold text-brand-500 hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
