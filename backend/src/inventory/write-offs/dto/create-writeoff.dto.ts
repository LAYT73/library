import { Type } from 'class-transformer';
import { IsString, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class CreateWriteOffDto {
  @IsString()
  reason: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  copyIds: number[];
}
