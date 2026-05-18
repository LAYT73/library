import { IsString, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateStudentGroupDto {
  @IsString()
  @MaxLength(40)
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  studentCount?: number;
}
