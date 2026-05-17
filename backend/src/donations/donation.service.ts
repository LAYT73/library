import { Injectable } from '@nestjs/common';
import { CopyStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@Injectable()
export class DonationService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async create(dto: { donorName: string; items: { bookId: number; quantity: number }[] }) {
    return this.prisma.$transaction(async (tx) => {
      const donation = await tx.donation.create({ data: { donorName: dto.donorName } });
      for (const item of dto.items) {
        await tx.donationItem.create({ data: { donationId: donation.id, bookId: item.bookId, quantity: item.quantity } });
        for (let i = 0; i < item.quantity; i++) {
          const max = await tx.copy.aggregate({ _max: { inventoryNumber: true } });
          const inventoryNumber = (max._max.inventoryNumber ?? 1000) + 1;
          await tx.copy.create({ data: { inventoryNumber, status: CopyStatus.AVAILABLE, bookId: item.bookId } });
        }
      }
      await this.audit.log({ action: 'create', entity: 'Donation', entityId: donation.id, changes: { donorName: dto.donorName } });
      return donation;
    });
  }
}
