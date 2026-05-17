import { IsString, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @MaxLength(180)
  name: string;

  @IsString()
  @MaxLength(400)
  contactInfo: string;
}
