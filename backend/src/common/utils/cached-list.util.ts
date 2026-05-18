import { AppCacheService } from '../cache/app-cache.service';
import { PaginatedResult } from './pagination.util';

export async function cachedList<T>(
  cache: AppCacheService,
  entity: string,
  query: Record<string, unknown>,
  fetcher: () => Promise<PaginatedResult<T>>,
  ttlSeconds = 60,
): Promise<PaginatedResult<T>> {
  const key = cache.listKey(entity, query);
  const hit = await cache.get<PaginatedResult<T>>(key);
  if (hit) return hit;
  const result = await fetcher();
  await cache.set(key, result, ttlSeconds);
  return result;
}
