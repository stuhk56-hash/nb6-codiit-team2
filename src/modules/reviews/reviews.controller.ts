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
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, ProductReviewParamsStruct);
  const body: CreateReviewDto = structCreate(req.body, CreateReviewBodyStruct);

  const review = await reviewsService.createReview(
    authUser,
    params.productId,
    body,
  );

  res.status(201).send(review);
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
