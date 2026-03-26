import { Prisma } from '@prisma/client';
import { BadRequestError } from '../../../lib/errors/customErrors';
import { reviewsRepository } from '../reviews.repository';
import { ReviewsService } from '../reviews.service';
import {
  toReviewDetailResponseDto,
  toReviewListResponseDto,
  toReviewResponseDto,
} from '../utils/reviews.mapper';
import {
  ensureCreateReviewInput,
  ensureOrderItemPurchasableByBuyer,
  ensurePaidOrderItem,
  ensureReviewOwner,
  ensureUpdateReviewInput,
  normalizeReviewsQuery,
  requireOrderItem,
  requireProduct,
  requireReview,
} from '../utils/reviews.service.util';

jest.mock('../reviews.repository', () => ({
  reviewsRepository: {
    findProductById: jest.fn(),
    findOrderItemById: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    findPageByProductId: jest.fn(),
  },
}));

jest.mock('../utils/reviews.mapper', () => ({
  toReviewResponseDto: jest.fn((review: any) => ({ id: review.id })),
  toReviewDetailResponseDto: jest.fn((review: any) => ({
    reviewId: review.id,
  })),
  toReviewListResponseDto: jest.fn(
    (reviews: any[], totalCount: number, page: number, limit: number) => ({
      items: reviews,
      meta: {
        total: totalCount,
        page,
        limit,
        hasNextPage: false,
      },
    }),
  ),
}));

jest.mock('../utils/reviews.service.util', () => ({
  ensureCreateReviewInput: jest.fn(),
  ensureOrderItemPurchasableByBuyer: jest.fn(),
  ensurePaidOrderItem: jest.fn(),
  ensureReviewOwner: jest.fn(),
  ensureUpdateReviewInput: jest.fn(),
  normalizeReviewsQuery: jest.fn(),
  requireOrderItem: jest.fn((value: unknown) => value),
  requireProduct: jest.fn((value: unknown) => value),
  requireReview: jest.fn((value: unknown) => value),
}));

describe('reviews.service', () => {
  const service = new ReviewsService();
  const mockedRepository = reviewsRepository as jest.Mocked<
    typeof reviewsRepository
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createReview - 입력값 검증/권한/중복 작성 로직을 검증한다', async () => {
    const user = { id: 'buyer-1', type: 'BUYER' } as any;
    const orderItem = { id: 'order-item-1' } as any;
    const created = { id: 'review-1' } as any;

    mockedRepository.findProductById.mockResolvedValue({ id: 'product-1' } as any);
    mockedRepository.findOrderItemById.mockResolvedValue(orderItem);
    mockedRepository.create.mockResolvedValue(created);

    const result = await service.createReview(user, 'product-1', {
      orderItemId: 'order-item-1',
      rating: 5,
      content: '좋아요',
    });

    expect(ensureCreateReviewInput).toHaveBeenCalledWith({
      orderItemId: 'order-item-1',
      rating: 5,
      content: '좋아요',
    });
    expect(requireProduct).toHaveBeenCalledWith(
      { id: 'product-1' },
      '상품을 찾지 못했습니다.',
    );
    expect(requireOrderItem).toHaveBeenCalledWith(
      orderItem,
      '주문 아이템을 찾지 못했습니다.',
    );
    expect(ensureOrderItemPurchasableByBuyer).toHaveBeenCalledWith(
      orderItem,
      'buyer-1',
      'product-1',
    );
    expect(ensurePaidOrderItem).toHaveBeenCalledWith(orderItem);
    expect(mockedRepository.create).toHaveBeenCalledWith({
      buyerId: 'buyer-1',
      productId: 'product-1',
      orderItemId: 'order-item-1',
      rating: 5,
      content: '좋아요',
    });
    expect(toReviewResponseDto).toHaveBeenCalledWith(created);
    expect(result).toEqual({ id: 'review-1' });

    mockedRepository.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: '6.19.0',
      }),
    );

    await expect(
      service.createReview(user, 'product-1', {
        orderItemId: 'order-item-1',
        rating: 5,
        content: '중복',
      }),
    ).rejects.toThrow(BadRequestError);
  });

  test('findReviewDetail - 응답 매핑을 검증한다', async () => {
    const review = { id: 'review-1' } as any;
    mockedRepository.findById.mockResolvedValue(review);

    const result = await service.findReviewDetail('review-1');

    expect(mockedRepository.findById).toHaveBeenCalledWith('review-1');
    expect(requireReview).toHaveBeenCalledWith(review, '리뷰를 찾을 수 없습니다.');
    expect(toReviewDetailResponseDto).toHaveBeenCalledWith(review);
    expect(result).toEqual({ reviewId: 'review-1' });
  });

  test('updateReview - 작성자 검증과 업데이트를 검증한다', async () => {
    const user = { id: 'buyer-1', type: 'BUYER' } as any;
    const review = { id: 'review-1', buyerId: 'buyer-1' } as any;
    const updated = { id: 'review-1' } as any;
    mockedRepository.findById.mockResolvedValue(review);
    mockedRepository.updateById.mockResolvedValue(updated);

    const result = await service.updateReview(user, 'review-1', {
      rating: 4,
      content: '수정',
    });

    expect(ensureUpdateReviewInput).toHaveBeenCalledWith({
      rating: 4,
      content: '수정',
    });
    expect(requireReview).toHaveBeenCalledWith(review, '리뷰를 찾을 수 없습니다.');
    expect(ensureReviewOwner).toHaveBeenCalledWith(review, 'buyer-1');
    expect(mockedRepository.updateById).toHaveBeenCalledWith('review-1', {
      rating: 4,
      content: '수정',
    });
    expect(toReviewResponseDto).toHaveBeenCalledWith(updated);
    expect(result).toEqual({ id: 'review-1' });
  });

  test('deleteReview - 작성자 검증과 삭제를 검증한다', async () => {
    const user = { id: 'buyer-1', type: 'BUYER' } as any;
    const review = { id: 'review-1', buyerId: 'buyer-1' } as any;
    mockedRepository.findById.mockResolvedValue(review);
    mockedRepository.deleteById.mockResolvedValue(review);

    await service.deleteReview(user, 'review-1');

    expect(requireReview).toHaveBeenCalledWith(review, '리뷰를 찾을 수 없습니다.');
    expect(ensureReviewOwner).toHaveBeenCalledWith(review, 'buyer-1');
    expect(mockedRepository.deleteById).toHaveBeenCalledWith('review-1');
  });

  test('findProductReviews - 페이지네이션 메타 포함 응답을 검증한다', async () => {
    const normalized = { page: 2, limit: 3 };
    const reviews = [{ id: 'review-3' }] as any[];
    mockedRepository.findProductById.mockResolvedValue({ id: 'product-1' } as any);
    (normalizeReviewsQuery as jest.Mock).mockReturnValue(normalized);
    mockedRepository.findPageByProductId.mockResolvedValue({
      reviews,
      totalCount: 7,
    } as any);

    const result = await service.findProductReviews('product-1', {
      page: 2,
      limit: 3,
    });

    expect(requireProduct).toHaveBeenCalledWith(
      { id: 'product-1' },
      '상품을 찾지 못했습니다.',
    );
    expect(normalizeReviewsQuery).toHaveBeenCalledWith({
      page: 2,
      limit: 3,
    });
    expect(mockedRepository.findPageByProductId).toHaveBeenCalledWith(
      'product-1',
      normalized,
    );
    expect(toReviewListResponseDto).toHaveBeenCalledWith(reviews, 7, 2, 3);
    expect(result).toEqual({
      items: reviews,
      meta: {
        total: 7,
        page: 2,
        limit: 3,
        hasNextPage: false,
      },
    });
  });
});
