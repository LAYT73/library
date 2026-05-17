import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { CreatePurchaseRequestDto } from './dto/create-pr.dto';

@Injectable()
export class PurchaseRequestService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async create(dto: CreatePurchaseRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.create({ data: {} });
      for (const item of dto.items) {
        await tx.purchaseRequestItem.create({ data: { bookId: item.bookId, quantity: item.quantity, purchaseRequestId: pr.id } });
      }
      await this.audit.log({ action: 'create', entity: 'PurchaseRequest', entityId: pr.id, changes: { items: dto.items } });
      return pr;
    });
  }

  async findOne(id: number) {
    const pr = await this.prisma.purchaseRequest.findUnique({ where: { id }, include: { items: true } });
    if (!pr) throw new NotFoundException('PurchaseRequest not found');
    return pr;
  }
}
