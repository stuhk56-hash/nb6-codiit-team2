//장바구니 아이템 기본 정보
//PATCH /api/cart
export interface CartItemDto {
  id: string;
  cartId: string;
  productId: string;
  sizeId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}
