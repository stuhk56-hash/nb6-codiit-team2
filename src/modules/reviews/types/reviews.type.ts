import { Prisma } from '@prisma/client';
import type {
  reviewInclude,
  reviewOrderItemInclude,
  reviewSelect,
} from '../queries/reviews.query';

export type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: typeof reviewInclude;
}>;

export type OrderItemForReview = Prisma.OrderItemGetPayload<{
  include: typeof reviewOrderItemInclude;
}>;

export type ReviewListItem = Prisma.ReviewGetPayload<{
  select: typeof reviewSelect;
}>;

export type ReviewsQuery = {
  page?: number;
  limit?: number;
};

export type NormalizedReviewsQuery = {
  page: number;
  limit: number;
};

export type ReviewsPageResult = {
  reviews: ReviewListItem[];
  totalCount: number;
};

export type CreateReviewRecordInput = {
  buyerId: string;
  productId: string;
  orderItemId: string;
  rating: number;
  content: string;
};

export type UpdateReviewRecordInput = {
  rating?: number;
  content?: string;
};
