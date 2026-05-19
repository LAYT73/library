import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class AppCacheService {
  private readonly logger = new Logger(AppCacheService.name);
  /** Реестр ключей для prefix-invalidation (cache-manager v7 не даёт dump store) */
  private readonly keys = new Set<string>();

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cache.get<T>(key);
    if (value !== undefined && value !== null) {
      this.logger.debug(`CACHE HIT  ${key}`);
    }
    return value ?? undefined;
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    this.keys.add(key);
    await this.cache.set(key, value, ttlSeconds * 1000);
    this.logger.debug(`CACHE SET  ${key} ttl=${ttlSeconds}s`);
  }

  async del(key: string): Promise<void> {
    this.keys.delete(key);
    await this.cache.del(key);
    this.logger.debug(`CACHE DEL  ${key}`);
  }

  /** Сбросить все ключи с префиксом */
  async invalidatePrefix(prefix: string): Promise<void> {
    const toDelete = [...this.keys].filter((k) => k.startsWith(prefix));
    if (toDelete.length === 0) {
      this.logger.debug(`CACHE INVALIDATE prefix=${prefix}* keys=0`);
      return;
    }
    await Promise.all(toDelete.map((k) => this.del(k)));
    this.logger.log(`CACHE INVALIDATE prefix=${prefix}* keys=${toDelete.length}`);
  }

  listKey(entity: string, query: Record<string, unknown>): string {
    return `${entity}:list:${JSON.stringify(query)}`;
  }
}
