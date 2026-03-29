//장바구니 아이템 상세 정보
//GET /api/cart/{cartItemId}
export interface CartItemDetailDto {
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
  };
  cart: {
    id: string;
    buyerId: string;
    createdAt: string;
    updatedAt: string;
  };
}
