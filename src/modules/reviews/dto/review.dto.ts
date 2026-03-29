export type ReviewDto = {
  id: string;
  userId: string;
  productId: string;
  orderItemId: string | null;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
  };
};
