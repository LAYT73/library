import { useEffect, useState } from 'react';
import type { ListQueryParams } from '../types/list';
import { useDebouncedValue } from './useDebouncedValue';

export function useListQueryState<
  T extends Record<string, string | number | boolean | undefined> = Record<string, never>,
>(
  initialFilters?: T,
  take = 25,
) {
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<T>((initialFilters ?? {}) as T);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setSkip(0);
  }, [debouncedSearch, filters]);

  const params: ListQueryParams = {
    skip,
    take,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...filters,
  };

  return {
    skip,
    setSkip,
    search,
    setSearch,
    filters,
    setFilters,
    params,
    take,
  };
}
