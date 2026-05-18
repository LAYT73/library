import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, query, body, ip } = req;
    const user = (req as Request & { user?: { email?: string; sub?: string; role?: string } }).user;
    const userLabel = user ? `${user.email ?? user.sub} (${user.role ?? '?'})` : 'anonymous';
    const queryStr = Object.keys(query).length ? ` query=${JSON.stringify(query)}` : '';
    const bodyKeys =
      body && typeof body === 'object' && !Array.isArray(body)
        ? Object.keys(body as object)
        : [];
    const bodyHint = bodyKeys.length ? ` bodyKeys=[${bodyKeys.join(',')}]` : '';

    const start = Date.now();
    this.logger.log(`→ ${method} ${originalUrl}${queryStr}${bodyHint} | ${userLabel} | ip=${ip}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const res = context.switchToHttp().getResponse<{ statusCode: number }>();
          this.logger.log(
            `← ${method} ${originalUrl} ${res.statusCode} ${ms}ms | ${userLabel}`,
          );
        },
        error: (err: Error) => {
          const ms = Date.now() - start;
          this.logger.error(
            `✗ ${method} ${originalUrl} ${ms}ms | ${userLabel} | ${err.message}`,
          );
        },
      }),
    );
  }
}
