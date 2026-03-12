//장바구니 생성/조회 응답
//POST /api/cart
export interface CartResponseDto {
  id: string;
  buyerId: string;
  createdAt: string;
  updatedAt: string;
}
