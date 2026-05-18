import { Injectable } from '@nestjs/common';
import { CopyStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateDonationDto } from './dto/update-donation.dto';

@Injectable()
export class DonationService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(dto: {
    donorName: string;
    items: { bookId: number; quantity: number }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const donation = await tx.donation.create({
        data: { donorName: dto.donorName },
      });
      for (const item of dto.items) {
        await tx.donationItem.create({
          data: {
            donationId: donation.id,
            bookId: item.bookId,
            quantity: item.quantity,
          },
        });
        for (let i = 0; i < item.quantity; i++) {
          const max = await tx.copy.aggregate({
            _max: { inventoryNumber: true },
          });
          const inventoryNumber = (max._max.inventoryNumber ?? 1000) + 1;
          await tx.copy.create({
            data: {
              inventoryNumber,
              status: CopyStatus.AVAILABLE,
              bookId: item.bookId,
            },
          });
        }
      }
      await this.audit.log({
        action: 'create',
        entity: 'Donation',
        entityId: donation.id,
        changes: { donorName: dto.donorName },
      });
      return donation;
    });
  }

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.donation.findMany({
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { items: { include: { book: { include: { author: true } } } } },
      }),
      this.prisma.donation.count(),
    ]);

    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: number) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: { items: { include: { book: { include: { author: true } } } } },
    });
    if (!donation) throw new NotFoundException('Donation not found');
    return donation;
  }

  async update(id: number, dto: UpdateDonationDto) {
    await this.findOne(id);
    const updated = await this.prisma.donation.update({
      where: { id },
      data: {
        donorName: dto.donorName,
      },
    });
    await this.audit.log({
      action: 'update',
      entity: 'Donation',
      entityId: id,
      changes: dto,
    });
    return updated;
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const donation = await tx.donation.findUnique({
        where: { id },
        include: { items: { include: { book: { include: { author: true } } } } },
      });
      if (!donation) throw new NotFoundException('Donation not found');
      await tx.donationItem.deleteMany({ where: { donationId: id } });
      const deleted = await tx.donation.delete({ where: { id } });
      await this.audit.log({
        action: 'delete',
        entity: 'Donation',
        entityId: id,
      });
      return deleted;
    });
  }
}
