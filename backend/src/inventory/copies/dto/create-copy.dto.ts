import { IsInt, IsOptional } from 'class-validator';

export class CreateCopyDto {
  @IsInt()
  bookId: number;

  @IsOptional()
  @IsInt()
  acquisitionId?: number;
}
