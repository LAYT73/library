export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function toPaginatedResult<T>(
  data: T[],
  total: number,
  skip: number,
  take: number,
): PaginatedResult<T> {
  const pageSize = take > 0 ? take : 25;
  return {
    data,
    total,
    page: Math.floor(skip / pageSize) + 1,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Макс. размер страницы (таблицы и выпадающие списки) */
export const MAX_PAGE_SIZE = 500;

export function resolvePagination(skip = 0, take = 25) {
  const safeTake = Math.min(Math.max(take, 1), MAX_PAGE_SIZE);
  const safeSkip = Math.max(skip, 0);
  return { skip: safeSkip, take: safeTake };
}

export function searchContains(search?: string) {
  const q = search?.trim();
  if (!q) return undefined;
  return { contains: q, mode: 'insensitive' as const };
}
