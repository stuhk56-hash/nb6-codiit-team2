import { Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '../../../middlewares/authenticate';
import { productInclude } from '../queries/products.query';

export type ProductsMulterRequest = AuthenticatedRequest & {
  file?: Express.Multer.File;
};

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
