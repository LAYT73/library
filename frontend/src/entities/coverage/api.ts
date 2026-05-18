import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { CoverageReport } from '../../shared/types';

export const useCoverageReport = () => {
  return useQuery({
    queryKey: ['coverage', 'report'],
    queryFn: async () => {
      const res = await apiClient.getClient().get<CoverageReport[]>('/coverage/report');
      return res.data;
    },
  });
};
