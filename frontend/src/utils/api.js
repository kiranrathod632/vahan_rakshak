/**
 * API configuration and URL resolution helper
 * Resolves full backend API URL when VITE_API_URL is configured (e.g. on Vercel)
 * and falls back to relative paths for local development and proxying.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
