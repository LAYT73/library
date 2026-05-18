import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MaxLength(17)
  isbn: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(300)
  publisher: string;

  @IsInt()
  @Min(1000)
  @Type(() => Number)
  year: number;

  @IsInt()
  @Type(() => Number)
  authorId: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  knowledgeAreaIds?: number[];
}
