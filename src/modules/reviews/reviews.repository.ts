import { prisma } from '../../lib/constants/prismaClient';
import {
  reviewInclude,
  reviewOrderItemInclude,
  reviewSelect,
} from './queries/reviews.query';
import type {
  CreateReviewRecordInput,
  NormalizedReviewsQuery,
  ReviewsPageResult,
  UpdateReviewRecordInput,
} from './types/reviews.type';

export class ReviewsRepository {
  findProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
      },
    });
  }

  findOrderItemById(orderItemId: string) {
    return prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: reviewOrderItemInclude,
    });
  }

  create(data: CreateReviewRecordInput) {
    return prisma.review.create({
      data,
      include: reviewInclude,
    });
  }

  findById(reviewId: string) {
    return prisma.review.findUnique({
      where: { id: reviewId },
      include: reviewInclude,
    });
  }

  updateById(reviewId: string, data: UpdateReviewRecordInput) {
    return prisma.review.update({
      where: { id: reviewId },
      data,
      include: reviewInclude,
    });
  }

  deleteById(reviewId: string) {
    return prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async findPageByProductId(
    productId: string,
    query: NormalizedReviewsQuery,
  ): Promise<ReviewsPageResult> {
    const where = { productId };

    const [reviews, totalCount] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        select: reviewSelect,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.review.count({
        where,
      }),
    ]);

    return {
      reviews,
      totalCount,
    };
  }
}

export const reviewsRepository = new ReviewsRepository();
