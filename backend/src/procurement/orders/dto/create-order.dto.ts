import { IsInt } from 'class-validator';

export class CreateOrderFromRequestDto {
  @IsInt()
  supplierId: number;
}
