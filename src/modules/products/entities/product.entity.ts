export type ProductEntity = {
  id: string;
  storeId: string;
  name: string;
  content: string | null;
  price: number;
  isSoldOut: boolean;
  categoryId: string;
  imageUrl: string | null;
  imageKey: string | null;
  discountRate: number | null;
  discountStartTime: Date | null;
  discountEndTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
