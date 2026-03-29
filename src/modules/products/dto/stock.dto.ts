import type { SizeDto } from './size.dto';

export type StockDto = {
  id: string;
  productId: string;
  sizeId: number;
  quantity: number;
  size: SizeDto;
};
