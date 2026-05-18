import { Injectable, BadRequestException } from '@nestjs/common';
import { CopyStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { CreateWriteOffDto } from './dto/create-writeoff.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateWriteOffDto } from './dto/update-writeoff.dto';

@Injectable()
export class WriteOffService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async create(dto: CreateWriteOffDto) {
    return this.prisma.$transaction(async (tx) => {
      const writeOff = await tx.writeOff.create({ data: { reason: dto.reason } });

      for (const copyId of dto.copyIds) {
        await tx.writeOffItem.create({ data: { copyId, writeOffId: writeOff.id } });
        await tx.copy.update({ where: { id: copyId }, data: { status: CopyStatus.WRITTEN_OFF } });
      }

      await this.audit.log({ action: 'create', entity: 'WriteOff', entityId: writeOff.id, changes: { copyIds: dto.copyIds } });
      return writeOff;
    });
  }

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.writeOff.findMany({
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { items: { include: { copy: true } } },
      }),
      this.prisma.writeOff.count(),
    ]);

    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: number) {
    const writeOff = await this.prisma.writeOff.findUnique({ where: { id }, include: { items: { include: { copy: true } } } });
    if (!writeOff) throw new NotFoundException('WriteOff not found');
    return writeOff;
  }

  async update(id: number, dto: UpdateWriteOffDto) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.writeOff.update({
        where: { id },
        data: { reason: dto.reason },
      });

      if (dto.copyIds) {
        await tx.writeOffItem.deleteMany({ where: { writeOffId: id } });
        for (const copyId of dto.copyIds) {
          await tx.writeOffItem.create({ data: { copyId, writeOffId: id } });
          await tx.copy.update({ where: { id: copyId }, data: { status: CopyStatus.WRITTEN_OFF } });
        }
      }

      return tx.writeOff.findUnique({ where: { id }, include: { items: { include: { copy: true } } } });
    });

    await this.audit.log({ action: 'update', entity: 'WriteOff', entityId: id, changes: dto });
    return updated ?? existing;
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const writeOff = await tx.writeOff.findUnique({ where: { id }, include: { items: true } });
      if (!writeOff) throw new NotFoundException('WriteOff not found');
      await tx.writeOffItem.deleteMany({ where: { writeOffId: id } });
      const deleted = await tx.writeOff.delete({ where: { id } });
      await this.audit.log({ action: 'delete', entity: 'WriteOff', entityId: id });
      return deleted;
    });
  }
}
