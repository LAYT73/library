import { IsEnum, IsOptional } from 'class-validator';
import { PurchaseRequestStatus } from '@prisma/client';

export class UpdatePurchaseRequestDto {
  @IsOptional()
  @IsEnum(PurchaseRequestStatus)
  status?: PurchaseRequestStatus;
}
