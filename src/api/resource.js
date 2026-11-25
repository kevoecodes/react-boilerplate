import client from './client';

/**
 * Turn { search, sort, filter: { status: 'active' } } into the backend's query format:
 *   ?search=..&sort=..&filter[status]=active
 * Empty values are dropped; arrays are sent comma-separated.
 */
export const toQueryParams = (params = {}) => {
  const query = {};
  Object.entries(params).forEach(([key, value]) => {
    if (key === 'filter' && value && typeof value === 'object') {
      Object.entries(value).forEach(([field, v]) => {
        if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
          return;
        }
        query[`filter[${field}]`] = Array.isArray(v) ? v.join(',') : v;
      });
    } else if (value !== undefined && value !== null && value !== '') {
      query[key] = value;
    }
  });
  return query;
};

/**
 * Generic REST client for an /api/v1/{resource} endpoint.
 * @param {string} resource e.g. "products"
 */
export const createResourceApi = (resource) => ({
  /** @returns {Promise<import('@/types').Paginated<any>>} */
  list: (params) => client.get(`/${resource}`, { params: toQueryParams(params) }).then((r) => r.data),
  get: (id) => client.get(`/${resource}/${id}`).then((r) => r.data.data),
  create: (payload) => client.post(`/${resource}`, payload).then((r) => r.data.data),
  update: (id, payload) => client.put(`/${resource}/${id}`, payload).then((r) => r.data.data),
  remove: (id) => client.delete(`/${resource}/${id}`).then((r) => r.data),
});

export const usersApi = createResourceApi('users');
export const productsApi = createResourceApi('products');
export const ordersApi = createResourceApi('orders');

export const dashboardApi = {
  stats: () => client.get('/dashboard').then((r) => r.data.data),
};
