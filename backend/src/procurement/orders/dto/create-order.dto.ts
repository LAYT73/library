import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateOrderFromRequestDto {
  @IsInt()
  supplierId: number;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;
}
