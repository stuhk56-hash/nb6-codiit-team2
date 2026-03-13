import type { StoreResponseDto } from './store-response.dto';

export type FavoriteStoreRegisterResponseDto = {
  type: 'register';
  store: StoreResponseDto;
};
