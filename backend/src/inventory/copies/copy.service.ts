import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CopyStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { CreateCopyDto } from './dto/create-copy.dto';
import { UpdateCopyDto } from './dto/update-copy.dto';

@Injectable()
export class CopyService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private async nextInventoryNumber() {
    const max = await this.prisma.copy.aggregate({ _max: { inventoryNumber: true } });
    return (max._max.inventoryNumber ?? 1000) + 1;
  }

  async create(dto: CreateCopyDto) {
    const inventoryNumber = await this.nextInventoryNumber();
    try {
      const created = await this.prisma.copy.create({ data: { inventoryNumber, status: CopyStatus.AVAILABLE, bookId: dto.bookId, acquisitionId: dto.acquisitionId } });
      await this.audit.log({ action: 'create', entity: 'Copy', entityId: created.id });
      return created;
    } catch (e) {
      throw new BadRequestException('Failed to create copy');
    }
  }

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.copy.findMany({ skip, take, include: { book: true, acquisition: true } }),
      this.prisma.copy.count(),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: number) {
    const item = await this.prisma.copy.findUnique({ where: { id }, include: { book: true, acquisition: true } });
    if (!item) throw new NotFoundException('Copy not found');
    return item;
  }

  async update(id: number, dto: UpdateCopyDto) {
    await this.findOne(id);
    return this.prisma.copy.update({ where: { id }, data: { ...dto } });
  }

  async changeStatus(id: number, status: CopyStatus) {
    await this.findOne(id);
    const updated = await this.prisma.copy.update({ where: { id }, data: { status } });
    await this.audit.log({ action: 'update_status', entity: 'Copy', entityId: updated.id, changes: { status } });
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.copy.delete({ where: { id } });
    await this.audit.log({ action: 'delete', entity: 'Copy', entityId: id });
    return deleted;
  }
}
