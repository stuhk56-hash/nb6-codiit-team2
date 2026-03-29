//장바구니 전체 정보(아이템 포함) GET /api/cart
export interface CartWithItemsDto {
  id: string;
  buyerId: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    cartId: string;
    productId: string;
    sizeId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    product: {
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
    };
  }>;
}
