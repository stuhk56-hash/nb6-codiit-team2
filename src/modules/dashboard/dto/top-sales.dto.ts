import type { ProductInfoDto } from './product-info.dto';

export type TopSalesDto = {
  totalOrders: number;
  product: ProductInfoDto;
};
