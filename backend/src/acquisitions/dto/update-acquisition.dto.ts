import { IsOptional, IsInt, IsNumber } from 'class-validator';

export class UpdateAcquisitionDto {
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @IsOptional()
  @IsInt()
  supplierId?: number;

  @IsOptional()
  @IsInt()
  orderId?: number | null;
}
