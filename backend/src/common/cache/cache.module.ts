import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppCacheService } from './app-cache.service';

@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 60_000,
      max: 500,
    }),
  ],
  providers: [AppCacheService],
  exports: [AppCacheService, CacheModule],
})
export class AppCacheModule {}
