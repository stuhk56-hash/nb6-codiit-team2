export type StoreEntity = {
  id: string;
  sellerId: string;
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  imageUrl: string | null;
  imageKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};
