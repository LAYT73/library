import { Module } from '@nestjs/common';
import { PurchaseRequestService } from './pr.service';
import { PurchaseRequestController } from './pr.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [PurchaseRequestController],
  providers: [PurchaseRequestService, PrismaService, AuditService],
  exports: [PurchaseRequestService],
})
export class PurchaseRequestModule {}
