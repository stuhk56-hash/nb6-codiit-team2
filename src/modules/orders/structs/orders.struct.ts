import { object, string, number, array } from 'superstruct';

//주문 아이템
export const OrderItemStruct = object({
  productId: string(),
  sizeId: number(),
  quantity: number(),
});

//주문 생성
export const CreateOrderStruct = object({
  name: string(),
  phone: string(),
  address: string(),
  orderItems: array(OrderItemStruct),
  userPoint: number(),
});

//주문 수정
export const UpdateOrderStruct = object({
  name: string(),
  phone: string(),
  address: string(),
});
