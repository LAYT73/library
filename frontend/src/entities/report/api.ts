import { apiClient } from '../../shared/api/client';

const downloadBlob = async (url: string): Promise<Blob> => {
  const response = await apiClient.getClient().get(url, { responseType: 'blob' });
  return response.data;
};

export const downloadFundReport = (format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
  return downloadBlob(`/reports/fund?format=${format}`);
};

export const downloadCoverageReport = (disciplineId: number, format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
  return downloadBlob(`/reports/coverage/${disciplineId}?format=${format}`);
};

export const importFundCsv = async (csv: string) => {
  const response = await apiClient.getClient().post('/reports/import/fund', { csv });
  return response.data;
};
