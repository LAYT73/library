import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateDisciplineDto {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(300)
  @IsOptional()
  department?: string;
}
