import { Injectable, BadRequestException } from '@nestjs/common';
import { CopyStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';
import { CreateWriteOffDto } from './dto/create-writeoff.dto';

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
}
