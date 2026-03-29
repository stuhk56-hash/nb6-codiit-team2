export type CreateProductStockDto = {
  sizeId: number;
  quantity: number;
};

export type CreateProductSizeSpecDto = {
  sizeLabel: string;
  displayOrder?: number;
  totalLengthCm?: number | null;
  shoulderCm?: number | null;
  chestCm?: number | null;
  sleeveCm?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  thighCm?: number | null;
  riseCm?: number | null;
  hemCm?: number | null;
};

export type CreateProductDto = {
  name: string;
  price: number;
  content?: string;
  categoryName: string;
  stocks: CreateProductStockDto[];
  sizeSpecs?: CreateProductSizeSpecDto[];
  material?: string;
  color?: string;
  manufacturerName?: string;
  manufactureCountry?: string;
  manufactureDate?: string;
  caution?: string;
  qualityGuaranteeStandard?: string;
  asManagerName?: string;
  asPhoneNumber?: string;
  shippingFee?: number;
  extraShippingFee?: number;
  shippingCompany?: string;
  deliveryPeriod?: string;
  returnExchangePolicy?: string;
  returnShippingFee?: number;
  exchangeShippingFee?: number;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
};

export type UpdateProductDto = Partial<CreateProductDto> & {
  isSoldOut?: boolean;
};
