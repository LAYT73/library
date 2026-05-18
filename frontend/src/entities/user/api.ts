import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { UserListItem } from '../../shared/types';

export const useUsers = (skip = 0, take = 25) => {
  return useQuery({
    queryKey: ['users', skip, take],
    queryFn: async () => {
      const res = await apiClient.getClient().get<{ data: UserListItem[]; total: number; page: number; pageSize: number }>('/users', { params: { skip, take } });
      return res.data;
    },
  });
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (payload: { email: string; fullName: string; role: string; department?: string; password: string }) => {
      const res = await apiClient.getClient().post('/users', payload);
      return res.data;
    },
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<{ fullName: string; role: string; department?: string }> }) => {
      const res = await apiClient.getClient().patch(`/users/${id}`, payload);
      return res.data;
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.getClient().delete(`/users/${id}`);
      return res.data;
    },
  });
};
