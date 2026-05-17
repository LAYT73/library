import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [ReportingController],
  providers: [ReportingService, PrismaService, AuditService],
  exports: [ReportingService],
})
export class ReportingModule {}
