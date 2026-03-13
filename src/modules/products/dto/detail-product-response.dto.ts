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
  categoryId: string;
  category: CategoryResponseDto;
  stocks: StocksResponseDto[];
  isSoldOut: boolean;
};
