import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class AppCacheService {
  private readonly logger = new Logger(AppCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cache.get<T>(key);
    if (value !== undefined && value !== null) {
      this.logger.debug(`CACHE HIT  ${key}`);
    }
    return value ?? undefined;
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    await this.cache.set(key, value, ttlSeconds * 1000);
    this.logger.debug(`CACHE SET  ${key} ttl=${ttlSeconds}s`);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
    this.logger.debug(`CACHE DEL  ${key}`);
  }

  /** Сбросить все ключи с префиксом (in-memory store) */
  async invalidatePrefix(prefix: string): Promise<void> {
    const store = (this.cache as Cache & { stores?: Array<{ dump?: () => Record<string, unknown> }> })
      .stores?.[0];
    const dump = store?.dump?.();
    if (!dump) {
      this.logger.debug(`CACHE INVALIDATE prefix=${prefix}* (no dump, skip)`);
      return;
    }
    const keys = Object.keys(dump).filter((k) => k.startsWith(prefix));
    await Promise.all(keys.map((k) => this.cache.del(k)));
    this.logger.log(`CACHE INVALIDATE prefix=${prefix}* keys=${keys.length}`);
  }

  listKey(entity: string, query: Record<string, unknown>): string {
    return `${entity}:list:${JSON.stringify(query)}`;
  }
}
