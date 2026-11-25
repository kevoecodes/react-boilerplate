import { createContext, useContext } from 'react';

/**
 * @typedef {Object} AuthContextValue
 * @property {import('@/types').User|null} user
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading          true while the stored token is being verified
 * @property {(credentials:{email:string,password:string}) => Promise<void>} login
 * @property {() => Promise<void>} logout
 */

/** @type {import('react').Context<AuthContextValue|null>} */
export const AuthContext = createContext(null);

/** @returns {AuthContextValue} */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
