import { useCallback, useState } from 'react';

/**
 * State for a server-side table: page, per_page, search, sort and filters.
 * Pass `params` to the list query and `setParams` / helpers to <DataTable />.
 *
 * @param {import('@/types').ListParams} [initial]
 */
export function useTableParams(initial = {}) {
  const [params, setParamsState] = useState({
    page: 1,
    per_page: 10,
    search: '',
    sort: undefined,
    filter: {},
    ...initial,
  });

  /** Merge changes; anything other than a page change resets to page 1. */
  const setParams = useCallback((patch) => {
    setParamsState((prev) => {
      const next = { ...prev, ...patch };
      if (!('page' in patch)) next.page = 1;
      return next;
    });
  }, []);

  const setFilter = useCallback(
    (name, value) =>
      setParamsState((prev) => ({ ...prev, page: 1, filter: { ...prev.filter, [name]: value } })),
    [],
  );

  const reset = useCallback(
    () => setParamsState((prev) => ({ ...prev, page: 1, search: '', sort: undefined, filter: {} })),
    [],
  );

  return { params, setParams, setFilter, reset };
}
