import { IsNumber, Min } from 'class-validator';

export class CreateAcquisitionFromOrderDto {
  @IsNumber()
  @Min(0)
  totalCost!: number;
}
