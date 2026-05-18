import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDonationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  donorName?: string;
}
