export type CreateStoreDto = {
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  businessRegistrationNumber?: string;
  businessPhoneNumber?: string;
  mailOrderSalesNumber?: string;
  representativeName?: string;
  businessAddress?: string;
};

export type UpdateStoreDto = Partial<CreateStoreDto>;
