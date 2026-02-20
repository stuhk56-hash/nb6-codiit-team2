import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { StockDto } from './stock.dto';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  categoryName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockDto)
  stocks: StockDto[];

  @IsNumber()
  @IsOptional()
  discountRate?: number;

  @IsString()
  @IsOptional()
  discountStartTime?: string;

  @IsString()
  @IsOptional()
  discountEndTime?: string;
}
