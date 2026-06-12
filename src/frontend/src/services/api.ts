import axios from 'axios';
import type { Client, KpiData, Policy } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginApi = (email: string, password: string) =>
  api.post<{ access_token: string }>('/auth/login', { email, password });

export const getPolicies = () => api.get<Policy[]>('/policies');

export const getKpis = () => api.get<KpiData>('/policies/kpis');

export const updatePolicy = (
  id: string,
  data: { isManaged?: boolean; isRenewed?: boolean; notes?: string },
) => api.patch<Policy>(`/policies/${id}`, data);

export const getClients = () => api.get<Client[]>('/clients');

export default api;
