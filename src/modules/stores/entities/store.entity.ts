export type StoreEntity = {
  id: string;
  sellerId: string;
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  businessRegistrationNumber: string | null;
  businessPhoneNumber: string | null;
  mailOrderSalesNumber: string | null;
  representativeName: string | null;
  businessAddress: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};
