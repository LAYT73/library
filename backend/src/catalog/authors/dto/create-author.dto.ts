import { IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  @MaxLength(150)
  fullName: string;
}
