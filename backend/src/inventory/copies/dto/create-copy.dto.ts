import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateCopyDto {
  @IsInt()
  @Type(() => Number)
  bookId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  acquisitionId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  inventoryNumber?: number;
}
