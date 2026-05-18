import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { PaginatedResponse, StudentGroup } from '../../shared/types';

export const useStudentGroups = (skip = 0, take = 25) => {
  return useQuery({
    queryKey: ['student-groups', skip, take],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedResponse<StudentGroup>>('/student-groups', { params: { skip, take } });
      return res.data;
    },
  });
};

export const useCreateStudentGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; studentCount: number }) => {
      const res = await apiClient.getClient().post<StudentGroup>('/student-groups', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-groups'] }),
  });
};

export const useUpdateStudentGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { name?: string; studentCount?: number } }) => {
      const res = await apiClient.getClient().patch<StudentGroup>(`/student-groups/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-groups'] }),
  });
};

export const useDeleteStudentGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete(`/student-groups/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-groups'] }),
  });
};
