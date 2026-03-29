import { Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '../../../middlewares/authenticate';
import { productInclude } from '../queries/products.query';

export type ProductsMulterRequest = AuthenticatedRequest & {
  file?: Express.Multer.File;
};

export type UploadedProductImage =
  | {
      url: string;
      key: string;
    }
  | null
  | undefined;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export type ProductInquiryWithAnswer = Prisma.InquiryGetPayload<{
  include: {
    answer: true;
    buyer: true;
  };
}>;

export type ProductSort =
  | 'mostReviewed'
  | 'recent'
  | 'lowPrice'
  | 'highPrice'
  | 'highRating'
  | 'salesRanking';

export type ProductListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: ProductSort;
  priceMin?: number;
  priceMax?: number;
  size?: string;
  favoriteStore?: string;
  categoryName?: string;
};

export type NormalizedProductListQuery = Required<ProductListQuery>;

export type ProductInquiryListQuery = {
  page?: number;
  pageSize?: number;
  sort?: 'oldest' | 'recent';
  status?: string;
};

export type NormalizedProductInquiryListQuery = {
  page: number;
  pageSize: number;
  sort: 'oldest' | 'recent';
  status: string;
};

export type ProductStockInput = {
  sizeId: number;
  quantity: number;
};

export type ProductSizeSpecInput = {
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

export type CreateProductRecordInput = {
  storeId: string;
  categoryId: string;
  name: string;
  price: number;
  content?: string;
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
  imageUrl?: string;
  imageKey?: string;
  discountRate?: number;
  discountStartTime?: Date;
  discountEndTime?: Date;
  stocks: ProductStockInput[];
  sizeSpecs?: ProductSizeSpecInput[];
};

export type UpdateProductRecordInput = {
  categoryId?: string;
  name?: string;
  price?: number;
  content?: string;
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
  imageUrl?: string;
  imageKey?: string;
  discountRate?: number;
  discountStartTime?: Date | null;
  discountEndTime?: Date | null;
  stocks: ProductStockInput[];
  sizeSpecs?: ProductSizeSpecInput[];
};

export type CreateProductInquiryInput = {
  productId: string;
  buyerId: string;
  title: string;
  content: string;
  isSecret?: boolean;
};
