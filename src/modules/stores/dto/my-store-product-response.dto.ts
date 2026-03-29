import type { MyStoreProductDto } from './my-store-product.dto';

export type MyStoreProductResponseDto = {
  list: MyStoreProductDto[];
  totalCount: number;
};
