import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayNotEmpty,
  IsInt,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class DonationItemDto {
  @IsInt()
  @Type(() => Number)
  bookId: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class CreateDonationDto {
  @IsString()
  @MaxLength(200)
  donorName: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DonationItemDto)
  items: DonationItemDto[];
}
