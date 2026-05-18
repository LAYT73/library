const copyStatusLabels: Record<string, string> = {
  AVAILABLE: 'Доступен',
  ISSUED: 'Выдан',
  WRITTEN_OFF: 'Списан',
  LOST: 'Утерян',
};

const purchaseRequestStatusLabels: Record<string, string> = {
  CREATED: 'Создана',
  APPROVED: 'Одобрена',
  REJECTED: 'Отклонена',
  COMPLETED: 'Выполнена',
};

const orderStatusLabels: Record<string, string> = {
  CREATED: 'Создан',
  SENT: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

export const formatCopyStatus = (status: string): string =>
  copyStatusLabels[status] ?? status;

export const formatPurchaseRequestStatus = (status: string): string =>
  purchaseRequestStatusLabels[status] ?? status;

export const formatOrderStatus = (status: string): string =>
  orderStatusLabels[status] ?? status;

export const formatDateTimeRu = (value: string | Date | null | undefined): string => {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMoneyRu = (value: string | number | null | undefined): string => {
  if (value == null || value === '') return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(n);
};

export const formatDateRu = (value: string | Date | null | undefined): string => {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
