import { object, string, number, array } from 'superstruct';

//사이즈별 수량 스키마

export const SizeQuantityStruct = object({
  sizeId: number(),
  quantity: number(),
});

// 장바구니 업데이트 요청 스키마

export const UpdateCartStruct = object({
  productId: string(),
  sizes: array(SizeQuantityStruct),
});
