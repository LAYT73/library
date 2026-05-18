import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsInt()
  supplierId?: number;

  @IsOptional()
  @IsInt()
  purchaseRequestId?: number | null;

  @IsOptional()
  @IsDateString()
  expectedDate?: string | null;
}
