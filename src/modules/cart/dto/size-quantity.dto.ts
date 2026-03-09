/**
 * 사이즈별 수량 정보
 * PATCH /api/cart 요청 body
 */
export interface SizeQuantityDto {
  sizeId: number;
  quantity: number;
}
