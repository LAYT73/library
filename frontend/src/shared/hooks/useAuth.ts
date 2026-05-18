import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { AuthResponse } from '../types';

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiClient
        .getClient()
        .post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      fullName: string;
    }) => {
      const response = await apiClient
        .getClient()
        .post<AuthResponse>('/auth/register', data);
      return response.data;
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const response = await apiClient
        .getClient()
        .get('/auth/profile');
      return response.data;
    },
    retry: false,
  });
};
