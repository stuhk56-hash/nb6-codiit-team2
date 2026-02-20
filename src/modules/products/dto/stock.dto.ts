import { IsNumber, IsString } from 'class-validator';

export class StockDto {
  @IsString()
  size: string;

  @IsNumber()
  quantity: number;
}
