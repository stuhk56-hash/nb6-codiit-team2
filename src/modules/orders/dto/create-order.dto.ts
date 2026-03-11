export interface CreateOrderDto {
  name: string;
  phone: string;
  address: string;
  orderItems: Array<{
    productId: string;
    sizeId: number;
    quantity: number;
  }>;
  usePoint: number;
}
