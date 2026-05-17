import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class PurchaseRequestItemDto {
  @IsInt()
  bookId: number;

  @IsInt()
  quantity: number;
}

export class CreatePurchaseRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  items: PurchaseRequestItemDto[];
}
