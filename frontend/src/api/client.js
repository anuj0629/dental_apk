import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dental_ai_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}

export function apiError(error, fallback = 'Something went wrong') {
  const message = error?.response?.data?.message;
  const details = error?.response?.data?.details;

  if (message && details) return `${message}: ${details}`;
  return message || fallback;
}
