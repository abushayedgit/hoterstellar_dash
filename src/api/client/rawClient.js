// src/api/client/rawClient.js
import axios from 'axios';
import { normalizeError } from './normalizeError';

// Empty string ⇒ same-origin requests (Vite proxy in dev, reverse-proxy in prod).
// Only override with an absolute URL when the API is on a different origin.
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const rawClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000,
});

// Normalize every rejection into an ApiError so callers can rely on
// `.status`, `.code`, `.message`, and `.details` regardless of which
// client they used. No refresh logic — that belongs to apiClient only.
rawClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);
