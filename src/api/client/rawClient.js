import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const rawClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000,
});
