import { IsString, MaxLength } from 'class-validator';

export class CreateDisciplineDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(300)
  department: string;
}
