import { IsInt } from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  studentGroupId: number;

  @IsInt()
  disciplineId: number;
}
