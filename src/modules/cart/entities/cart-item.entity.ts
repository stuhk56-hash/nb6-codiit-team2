//CartItem 엔티티
export interface CartItemEntity {
  id: string;
  cartId: string;
  productId: string;
  sizeId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
