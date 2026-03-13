import type { StoreDto } from './store.dto';

export type StoreResponseDto = StoreDto;

export type StoreDetailResponseDto = StoreDto & {
  favoriteCount: number;
};
