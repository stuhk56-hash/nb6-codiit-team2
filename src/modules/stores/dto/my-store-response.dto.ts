import type { StoreDto } from './store.dto';

export type MyStoreResponseDto = StoreDto & {
  productCount: number;
  favoriteCount: number;
  monthFavoriteCount: number;
  totalSoldCount: number;
};
