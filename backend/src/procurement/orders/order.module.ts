import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../../common/audit.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService, AuditService],
  exports: [OrderService],
})
export class OrderModule {}
