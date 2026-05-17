import { Module } from '@nestjs/common';
import { WriteOffService } from './writeoff.service';
import { WriteOffController } from './writeoff.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [WriteOffController],
  providers: [WriteOffService, PrismaService, AuditService],
})
export class WriteOffModule {}
