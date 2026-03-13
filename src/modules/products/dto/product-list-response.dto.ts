import type { ProductListDto } from './product-list.dto';

export type ProductListResponseDto = {
  list: ProductListDto[];
  totalCount: number;
};
