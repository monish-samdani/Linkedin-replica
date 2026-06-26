import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as jobsApi from '../../../api/jobs';

const EMPTY_FILTERS = { search: '', jobType: '', workplace: '', location: '' };
const DEBOUNCE_MS = 400;

const buildParams = (filters, page) => {
  const params = { page, limit: 10 };
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params[key] = value;
  });
  return params;
};

// Drives the job feed: filters (debounced), pagination ("load more"), and search.
export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState(EMPTY_FILTERS);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedFilters(filters), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [filters]);

  // Reload from page 1 whenever the (debounced) filters change or a refetch is requested.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setPage(1);
    jobsApi
      .getJobs(buildParams(debouncedFilters, 1))
      .then((data) => {
        if (!active) return;
        setJobs(data.jobs || []);
        setHasMore(Boolean(data.hasMore));
      })
      .catch((error) => {
        if (active) toast.error(error.response?.data?.message || 'Failed to load jobs');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedFilters, reloadToken]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await jobsApi.getJobs(buildParams(debouncedFilters, nextPage));
      setJobs((prev) => [...prev, ...(data.jobs || [])]);
      setHasMore(Boolean(data.hasMore));
      setPage(nextPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load more jobs');
    } finally {
      setLoadingMore(false);
    }
  }, [debouncedFilters, page]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return {
    jobs,
    loading,
    loadingMore,
    hasMore,
    filters,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    loadMore,
    refetch,
  };
}
