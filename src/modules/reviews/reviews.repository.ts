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

  // ✅ orderItemId로 리뷰 조회 (유니크)
  findByOrderItemId(orderItemId: string) {
    return prisma.review.findUnique({
      where: { orderItemId },
      include: reviewInclude,
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

  // ✅ 사용자가 특정 OrderItem에 대해 리뷰를 작성했는지 확인
  async hasReviewForOrderItem(orderItemId: string): Promise<boolean> {
    const review = await prisma.review.findUnique({
      where: { orderItemId },
      select: { id: true },
    });

    return !!review;
  }

  // ✅ 사용자의 특정 상품에 대한 모든 리뷰 조회
  async findAllByBuyerAndProduct(buyerId: string, productId: string) {
    return prisma.review.findMany({
      where: { buyerId, productId },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const reviewsRepository = new ReviewsRepository();
