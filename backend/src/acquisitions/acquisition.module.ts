import { Module } from '@nestjs/common';
import { AcquisitionService } from './acquisition.service';
import { AcquisitionController } from './acquisition.controller';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [AcquisitionController],
  providers: [AcquisitionService, PrismaService, AuditService],
})
export class AcquisitionModule {}
