import type { CategoryResponseDto } from './category-response.dto';
import type { StocksResponseDto } from './stocks-response.dto';

export type ProductReviewSummaryDto = {
  rate1Length: number;
  rate2Length: number;
  rate3Length: number;
  rate4Length: number;
  rate5Length: number;
  sumScore: number;
};

export type ProductInquirySummaryDto = {
  id: string;
  userId: string;
  title: string;
  content: string;
  isSecret: boolean;
  status: 'WaitingAnswer' | 'CompletedAnswer';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
  reply: {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
    };
  } | null;
};

export type DetailProductResponseDto = {
  id: string;
  name: string;
  image: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  reviewsRating: number;
  storeId: string;
  storeName: string;
  price: number;
  discountPrice: number;
  discountRate: number;
  discountStartTime: string | null;
  discountEndTime: string | null;
  reviewsCount: number;
  reviews: ProductReviewSummaryDto;
  inquiries: ProductInquirySummaryDto[];
  sellerInfo: {
    businessRegistrationNumber: string | null;
    businessPhoneNumber: string | null;
    mailOrderSalesNumber: string | null;
    representativeName: string | null;
    businessAddress: string | null;
  };
  noticeInfo: {
    material: string | null;
    color: string | null;
    manufacturerName: string | null;
    manufactureCountry: string | null;
    manufactureDate: string | null;
    caution: string | null;
    qualityGuaranteeStandard: string | null;
    asManagerName: string | null;
    asPhoneNumber: string | null;
  };
  tradeInfo: {
    shippingFee: number | null;
    extraShippingFee: number | null;
    shippingCompany: string | null;
    deliveryPeriod: string | null;
    returnExchangePolicy: string | null;
    returnShippingFee: number | null;
    exchangeShippingFee: number | null;
  };
  sizeGuideType: 'TOP' | 'BOTTOM' | 'NONE';
  sizeSpecs: Array<{
    sizeLabel: string;
    displayOrder: number;
    totalLengthCm: number | null;
    shoulderCm: number | null;
    chestCm: number | null;
    sleeveCm: number | null;
    waistCm: number | null;
    hipCm: number | null;
    thighCm: number | null;
    riseCm: number | null;
    hemCm: number | null;
  }>;
  categoryId: string;
  category: CategoryResponseDto;
  stocks: StocksResponseDto[];
  isSoldOut: boolean;
};
