import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import type { Book } from '../../shared/types';

export interface DonationLineItem {
  id: number;
  quantity: number;
  bookId: number;
  book?: Book;
}

export interface DonationListItem {
  id: number;
  donorName: string;
  date: string;
  items: DonationLineItem[];
}

export interface PaginatedDonationResponse {
  data: DonationListItem[];
  total: number;
  page: number;
  pageSize: number;
}

import { buildListParams, type ListQueryParams } from '../../shared/types/list';

export const useDonations = (params: ListQueryParams = {}) => {
  return useQuery({
    queryKey: ['donations', params],
    queryFn: async () => {
      const res = await apiClient.getClient().get<PaginatedDonationResponse>('/donations', {
        params: buildListParams(params),
      });
      return res.data;
    },
  });
};

export const useCreateDonation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { donorName: string; items: Array<{ bookId: number; quantity: number }> }) => {
      const res = await apiClient.getClient().post('/donations', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['donations'] }),
  });
};

export const useUpdateDonation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { donorName?: string } }) => {
      const res = await apiClient.getClient().patch(`/donations/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['donations'] }),
  });
};

export const useDeleteDonation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.getClient().delete(`/donations/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['donations'] }),
  });
};
