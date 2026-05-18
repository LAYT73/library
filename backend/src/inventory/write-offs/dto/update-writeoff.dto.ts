import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
  IsInt,
} from 'class-validator';

export class UpdateWriteOffDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  copyIds?: number[];
}
