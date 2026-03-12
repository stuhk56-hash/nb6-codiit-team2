//장바구니 내 상품 정보
export interface CartProductDto {
  id: string;
  storeId: string;
  name: string;
  price: number;
  image: string;
  discountRate: number | null;
  discountStartTime: string | null;
  discountEndTime: string | null;
  createdAt: string;
  updatedAt: string;
  reviewsRating: number;
  categoryId: string;
  content: string | null;
  isSoldOut: boolean;
  store: {
    id: string;
    userId: string;
    name: string;
    address: string;
    phoneNumber: string;
    content: string;
    image: string;
    createdAt: string;
    updatedAt: string;
    detailAddress: string;
  };
  stocks: Array<{
    id: string;
    productId: string;
    sizeId: number;
    quantity: number;
    size: {
      id: number;
      size: {
        en: string;
        ko: string;
      };
      name: string;
    };
  }>;
}
