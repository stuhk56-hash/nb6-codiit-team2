export type ProductListDto = {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  image: string;
  price: number;
  discountPrice: number;
  discountRate: number;
  discountStartTime: string;
  discountEndTime: string;
  reviewsCount: number;
  reviewsRating: number;
  createdAt: string;
  updatedAt: string;
  sales: number;
  isSoldOut: boolean;
};
