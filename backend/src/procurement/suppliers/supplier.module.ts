import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [SupplierController],
  providers: [SupplierService, PrismaService, AuditService],
  exports: [SupplierService],
})
export class SupplierModule {}
