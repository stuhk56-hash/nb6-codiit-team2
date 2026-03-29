import type { StoreResponseDto } from './store-response.dto';

export type FavoriteStoreDeleteResponseDto = {
  type: 'delete';
  store: StoreResponseDto;
};
