import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | number | null;
    changes?: unknown;
    ip?: string | null;
  }) {
    if (!params.userId) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true },
    });
    if (!user) {
      return null;
    }

    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId != null ? String(params.entityId) : null,
        changes: params.changes as Prisma.InputJsonValue | undefined,
        ipAddress: params.ip ?? null,
      },
    });
  }
}
