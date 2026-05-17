import { IsString, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class CreateWriteOffDto {
  @IsString()
  reason: string;

  @IsArray()
  @ArrayNotEmpty()
  // array of copy ids
  copyIds: number[];
}
