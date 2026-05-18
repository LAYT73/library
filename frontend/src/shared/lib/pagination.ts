import type { TablePaginationConfig } from 'antd';

export interface PaginatedMeta {
  page: number;
  total: number;
  pageSize: number;
}

/** Серверная пагинация для Ant Design Table — одна панель внизу таблицы */
export function getServerPagination(
  meta: PaginatedMeta | undefined,
  onSkipChange: (skip: number) => void,
): TablePaginationConfig | false {
  if (!meta) return false;

  const { page, pageSize, total } = meta;

  return {
    current: page,
    pageSize,
    total,
    showSizeChanger: false,
    hideOnSinglePage: total <= pageSize,
    showTotal: (t) => `Всего ${t}`,
    onChange: (nextPage) => onSkipChange((nextPage - 1) * pageSize),
  };
}
