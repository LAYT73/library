import { IsInt, Min } from 'class-validator';

export class CreateCoverageDto {
  @IsInt()
  bookId: number;

  @IsInt()
  disciplineId: number;

  @IsInt()
  @Min(1)
  requiredCount: number;
}
