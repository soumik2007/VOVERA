export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const ENDPOINTS = {
  health: '/health',
  analyze: '/analyze/post-call',
  flagSpam: '/spam/flag',
  checkSpam: (hash: string) => `/spam/check/${hash}`,
  translate: '/translate',
};
