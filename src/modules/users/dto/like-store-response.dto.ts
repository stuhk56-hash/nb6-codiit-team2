export interface LikedStoreDto {
  id: string;
  userId: string;
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LikeStoreResponseDto {
  storeId?: string;
  userId?: string;
  store: LikedStoreDto;
}
