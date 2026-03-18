export type ReviewEntity = {
  id: string;
  buyerId: string;
  productId: string;
  orderItemId: string | null;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};
