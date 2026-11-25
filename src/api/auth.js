import client from './client';

export const authApi = {
  /** @returns {Promise<{token:string, token_type:string, user: import('@/types').User}>} */
  login: (credentials) =>
    client.post('/auth/login', { ...credentials, device_name: 'web' }).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data.data),
  logout: () => client.post('/auth/logout').then((r) => r.data),
};
