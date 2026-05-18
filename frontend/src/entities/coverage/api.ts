import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { Coverage, CoverageReport, PaginatedResponse } from '../../shared/types';

export interface KnowledgeAreaCoverage {
  knowledgeAreaId: number;
  name: string;
  totalRequired: number;
  totalAvailable: number;
  coveragePercent: number;
}

export interface ReaderNeedsReport {
  disciplineId: number;
  discipline: string;
  department: string;
  readerCount: number;
  totalAvailable: number;
  compliancePercent: number;
}

export interface CoverageWithRelations extends Coverage {
  book?: { id: number; title: string };
  discipline?: { id: number; name: string; department: string };
}

export const useCoverageReport = () => {
  return useQuery({
    queryKey: ['coverage', 'report'],
    queryFn: async () => {
      const res = await apiClient.getClient().get<CoverageReport[]>('/coverage/report');
      return res.data;
    },
  });
};

export const useCoverageByKnowledgeArea = (disciplineId?: number) => {
  return useQuery({
    queryKey: ['coverage', 'knowledgeAreas', disciplineId ?? 'all'],
    queryFn: async () => {
      const url = disciplineId ? `/coverage/knowledge-areas?disciplineId=${disciplineId}` : '/coverage/knowledge-areas';
      const res = await apiClient.getClient().get<KnowledgeAreaCoverage[]>(url);
      return res.data;
    },
  });
};

export const useReaderNeedsReport = () => {
  return useQuery({
    queryKey: ['coverage', 'reader-needs'],
    queryFn: async () => {
      const res = await apiClient.getClient().get<ReaderNeedsReport[]>('/coverage/reader-needs');
      return res.data;
    },
  });
};

export const useCoverageRequirements = (skip = 0, take = 25, disciplineId?: number) => {
  return useQuery({
    queryKey: ['coverage', 'requirements', skip, take, disciplineId],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedResponse<CoverageWithRelations>>('/coverage', {
        params: { skip, take, ...(disciplineId ? { disciplineId } : {}) },
      });
      return res.data;
    },
  });
};

export const useCreateCoverage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { bookId: number; disciplineId: number; requiredCount: number }) => {
      const res = await apiClient.getClient().post<Coverage>('/coverage', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coverage'] });
    },
  });
};

export const useUpdateCoverage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, requiredCount }: { id: number; requiredCount: number }) => {
      const res = await apiClient.getClient().patch<Coverage>(`/coverage/${id}`, { requiredCount });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coverage'] });
    },
  });
};

export const useDeleteCoverage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete(`/coverage/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coverage'] });
    },
  });
};
