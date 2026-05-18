import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { CreatePurchaseRequestDto } from './dto/create-pr.dto';
import { UpdatePurchaseRequestDto } from './dto/update-pr.dto';

@Injectable()
export class PurchaseRequestService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(dto: CreatePurchaseRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.create({ data: {} });
      for (const item of dto.items) {
        await tx.purchaseRequestItem.create({
          data: {
            bookId: item.bookId,
            quantity: item.quantity,
            purchaseRequestId: pr.id,
          },
        });
      }
      await this.audit.log({
        action: 'create',
        entity: 'PurchaseRequest',
        entityId: pr.id,
        changes: { items: dto.items },
      });
      return pr;
    });
  }

  async findOne(id: number) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!pr) throw new NotFoundException('PurchaseRequest not found');
    return pr;
  }

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.purchaseRequest.findMany({
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { items: true },
      }),
      this.prisma.purchaseRequest.count(),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async update(id: number, dto: UpdatePurchaseRequestDto) {
    await this.findOne(id);
    const updated = await this.prisma.purchaseRequest.update({
      where: { id },
      data: { status: dto.status },
    });
    await this.audit.log({
      action: 'update',
      entity: 'PurchaseRequest',
      entityId: id,
      changes: dto,
    });
    return updated;
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!pr) throw new NotFoundException('PurchaseRequest not found');
      await tx.purchaseRequestItem.deleteMany({
        where: { purchaseRequestId: id },
      });
      const deleted = await tx.purchaseRequest.delete({ where: { id } });
      await this.audit.log({
        action: 'delete',
        entity: 'PurchaseRequest',
        entityId: id,
      });
      return deleted;
    });
  }
}
