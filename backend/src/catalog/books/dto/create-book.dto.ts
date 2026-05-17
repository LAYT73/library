import { IsString, IsInt, IsOptional, MaxLength } from 'class-validator';

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
  year: number;

  @IsInt()
  authorId: number;

  @IsOptional()
  @IsString({ each: true })
  knowledgeAreaIds?: string[];
}
