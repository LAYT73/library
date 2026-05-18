import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCoverageDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  requiredCount?: number;
}
