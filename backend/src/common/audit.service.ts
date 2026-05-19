import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuditService {
  private currentUserId: string | null = null;
  private fallbackUserId: string | null = null;

  constructor(private prisma: PrismaService) {}

  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  clearCurrentUserId(): void {
    this.currentUserId = null;
  }

  private async resolveUserId(explicit?: string | null): Promise<string | null> {
    if (explicit) {
      const user = await this.prisma.user.findUnique({
        where: { id: explicit },
        select: { id: true },
      });
      if (user) return user.id;
    }
    if (this.currentUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: this.currentUserId },
        select: { id: true },
      });
      if (user) return user.id;
    }
    if (!this.fallbackUserId) {
      const system = await this.prisma.user.findFirst({
        where: { email: 'admin@library.test', isActive: true },
        select: { id: true },
      });
      this.fallbackUserId = system?.id ?? null;
    }
    return this.fallbackUserId;
  }

  async log(params: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | number | null;
    changes?: unknown;
    ip?: string | null;
  }) {
    const userId = await this.resolveUserId(params.userId);
    if (!userId) {
      return null;
    }

    return this.prisma.auditLog.create({
      data: {
        userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId != null ? String(params.entityId) : null,
        changes: params.changes as Prisma.InputJsonValue | undefined,
        ipAddress: params.ip ?? null,
      },
    });
  }
}
