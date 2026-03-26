import type { Request, Response } from 'express';
import { create as structCreate } from 'superstruct';
import { requireAuthUser } from '../../lib/request/auth-user';
import type { AuthenticatedRequest } from '../../middlewares/authenticate';
import type { CreateReviewDto } from './dto/create-review.dto';
import type { ReviewsQuery } from './types/reviews.type';
import type { UpdateReviewDto } from './dto/update-review.dto';
import { reviewsService } from './reviews.service';
import {
  CreateReviewBodyStruct,
  ProductReviewParamsStruct,
  ReviewListQueryStruct,
  ReviewParamsStruct,
  UpdateReviewBodyStruct,
} from './structs/reviews.struct';

export async function createReview(req: AuthenticatedRequest, res: Response) {
  try {
    console.log('📝 리뷰 생성 요청 받음');
    console.log('req.params:', req.params);
    console.log('req.body:', req.body);

    const authUser = requireAuthUser(req);
    console.log('✅ 인증 확인 - userId:', authUser.id);

    // ✅ params 검증
    let params;
    try {
      params = structCreate(req.params, ProductReviewParamsStruct);
      console.log('✅ params 검증 통과:', params);
    } catch (error) {
      console.error('❌ params 검증 실패:', error);
      throw error;
    }

    // ✅ body 검증
    let body: CreateReviewDto;
    try {
      body = structCreate(req.body, CreateReviewBodyStruct);
      console.log('✅ body 검증 통과:', body);
    } catch (error) {
      console.error('❌ body 검증 실패:', error);
      console.error('❌ 실패 상세:', JSON.stringify(error, null, 2));
      throw error;
    }

    const review = await reviewsService.createReview(
      authUser,
      params.productId,
      body,
    );
    console.log('✅ 리뷰 생성 완료:', review);

    res.status(201).send(review);
  } catch (error) {
    console.error('❌ createReview 에러:', error);
    console.error(
      '❌ 에러 메시지:',
      error instanceof Error ? error.message : String(error),
    );

    // ✅ 에러 응답
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error: String(error),
    });
  }
}

export async function findProductReviews(req: Request, res: Response) {
  const params = structCreate(req.params, ProductReviewParamsStruct);
  const query: ReviewsQuery = structCreate(req.query, ReviewListQueryStruct);

  const reviews = await reviewsService.findProductReviews(
    params.productId,
    query,
  );
  res.send(reviews);
}

export async function findReviewDetail(req: Request, res: Response) {
  const params = structCreate(req.params, ReviewParamsStruct);

  const review = await reviewsService.findReviewDetail(params.reviewId);
  res.send(review);
}

export async function updateReview(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, ReviewParamsStruct);
  const body: UpdateReviewDto = structCreate(req.body, UpdateReviewBodyStruct);

  const review = await reviewsService.updateReview(
    authUser,
    params.reviewId,
    body,
  );
  res.send(review);
}

export async function deleteReview(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, ReviewParamsStruct);

  await reviewsService.deleteReview(authUser, params.reviewId);
  res.status(204).end();
}
