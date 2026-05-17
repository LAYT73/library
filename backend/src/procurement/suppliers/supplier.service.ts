import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async create(dto: CreateSupplierDto) {
    const created = await this.prisma.supplier.create({ data: { name: dto.name, contactInfo: dto.contactInfo } });
    await this.audit.log({ action: 'create', entity: 'Supplier', entityId: created.id });
    return created;
  }

  async findAll(skip = 0, take = 25) {
    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({ skip, take }),
      this.prisma.supplier.count(),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: number) {
    const s = await this.prisma.supplier.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async update(id: number, dto: Partial<CreateSupplierDto>) {
    await this.findOne(id);
    const updated = await this.prisma.supplier.update({ where: { id }, data: dto });
    await this.audit.log({ action: 'update', entity: 'Supplier', entityId: updated.id, changes: dto });
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.supplier.delete({ where: { id } });
    await this.audit.log({ action: 'delete', entity: 'Supplier', entityId: id });
    return deleted;
  }
}
