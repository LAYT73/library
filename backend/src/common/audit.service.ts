import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: { userId?: string | null; action: string; entity: string; entityId?: string | number | null; changes?: any; ip?: string | null }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId ?? 'system',
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ? String(params.entityId) : null,
        changes: params.changes ? params.changes : null,
        ipAddress: params.ip ?? null,
      },
    });
  }
}
