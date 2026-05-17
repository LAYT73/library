import { Injectable, NotFoundException } from '@nestjs/common';
import { CopyStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@Injectable()
export class AcquisitionService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async createFromOrder(orderId: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order) throw new NotFoundException('Order not found');

      const acquisition = await tx.acquisition.create({ data: { supplierId: order.supplierId, orderId: order.id, totalCost: 0 } });

      // create copies for each order item
      for (const item of order.items) {
        for (let i = 0; i < item.quantity; i++) {
          // generate inventory number
          const max = await tx.copy.aggregate({ _max: { inventoryNumber: true } });
          const inventoryNumber = (max._max.inventoryNumber ?? 1000) + 1;
          await tx.copy.create({ data: { inventoryNumber, status: CopyStatus.AVAILABLE, bookId: item.bookId, acquisitionId: acquisition.id } });
        }
      }

      await this.audit.log({ action: 'create', entity: 'Acquisition', entityId: acquisition.id, changes: { orderId: order.id } });
      return acquisition;
    });
  }
}
