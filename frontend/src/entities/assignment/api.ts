import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { Discipline, PaginatedResponse, StudentGroup } from '../../shared/types';

export interface DisciplineAssignment {
  id: number;
  studentGroupId: number;
  disciplineId: number;
  studentGroup?: StudentGroup;
  discipline?: Discipline;
}

export const useDisciplineAssignments = (skip = 0, take = 25, disciplineId?: number) => {
  return useQuery({
    queryKey: ['discipline-assignments', skip, take, disciplineId],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedResponse<DisciplineAssignment>>('/discipline-assignments', {
        params: { skip, take, ...(disciplineId ? { disciplineId } : {}) },
      });
      return res.data;
    },
  });
};

export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { studentGroupId: number; disciplineId: number }) => {
      const res = await apiClient.getClient().post<DisciplineAssignment>('/discipline-assignments', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discipline-assignments'] });
      qc.invalidateQueries({ queryKey: ['coverage', 'reader-needs'] });
    },
  });
};

export const useDeleteAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete(`/discipline-assignments/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discipline-assignments'] });
      qc.invalidateQueries({ queryKey: ['coverage', 'reader-needs'] });
    },
  });
};
