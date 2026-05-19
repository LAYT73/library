import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuditService } from '../audit.service';

/** Пробрасывает id пользователя из JWT в AuditService на время запроса. */
@Injectable()
export class AuditUserInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ user?: { id?: string } }>();
    const userId = req.user?.id;
    if (userId) {
      this.audit.setCurrentUserId(userId);
    }
    return next.handle().pipe(finalize(() => this.audit.clearCurrentUserId()));
  }
}
