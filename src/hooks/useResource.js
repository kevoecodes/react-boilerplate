import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi, productsApi, usersApi } from '@/api/resource';

/**
 * Build TanStack Query hooks for a resource API created with createResourceApi().
 * Call once at module level, then use the returned hooks inside components.
 *
 * @param {string} key    query-key root, e.g. "products"
 * @param {ReturnType<typeof import('@/api/resource').createResourceApi>} api
 */
export function createResourceHooks(key, api) {
  const useInvalidate = () => {
    const queryClient = useQueryClient();
    return () => {
      queryClient.invalidateQueries({ queryKey: [key] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };
  };

  return {
    /** Paginated list; keeps the previous page visible while the next one loads. */
    useList: (params, options = {}) =>
      useQuery({
        queryKey: [key, 'list', params],
        queryFn: () => api.list(params),
        placeholderData: keepPreviousData,
        ...options,
      }),

    useOne: (id, options = {}) =>
      useQuery({
        queryKey: [key, 'detail', id],
        queryFn: () => api.get(id),
        enabled: id != null,
        ...options,
      }),

    useCreate: () => {
      const invalidate = useInvalidate();
      return useMutation({ mutationFn: (payload) => api.create(payload), onSuccess: invalidate });
    },

    useUpdate: () => {
      const invalidate = useInvalidate();
      return useMutation({
        mutationFn: ({ id, ...payload }) => api.update(id, payload),
        onSuccess: invalidate,
      });
    },

    useRemove: () => {
      const invalidate = useInvalidate();
      return useMutation({ mutationFn: (id) => api.remove(id), onSuccess: invalidate });
    },
  };
}

export const usersResource = createResourceHooks('users', usersApi);
export const productsResource = createResourceHooks('products', productsApi);
export const ordersResource = createResourceHooks('orders', ordersApi);

/**
 * Options for a <Select> backed by a resource (first 100 matches, server-side search).
 * @param {ReturnType<typeof createResourceHooks>} resource
 * @param {(record:any) => {label:string, value:any}} toOption
 * @param {Object} [params]
 */
export function useResourceOptions(resource, toOption, params = {}) {
  const query = resource.useList({ per_page: 100, ...params }, { staleTime: 60_000 });
  return {
    options: (query.data?.data ?? []).map(toOption),
    loading: query.isLoading,
    records: query.data?.data ?? [],
  };
}
