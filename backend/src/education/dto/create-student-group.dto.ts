import { IsString, MaxLength, IsInt, Min } from 'class-validator';

export class CreateStudentGroupDto {
  @IsString()
  @MaxLength(40)
  name: string;

  @IsInt()
  @Min(0)
  studentCount: number;
}
