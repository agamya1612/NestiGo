import axios from 'axios';
import { supabase } from './supabase-client';
import { useAuthStore } from '@/store/useAuthStore';

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_GATEWAY,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
    config.headers['x-user-id'] = session.user.id;
    config.headers['x-user-role'] = session.user.user_metadata?.role || 'customer';
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);
