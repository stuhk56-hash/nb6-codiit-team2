import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  createReview,
  deleteReview,
  findProductReviews,
  findReviewDetail,
  updateReview,
} from './reviews.controller';

export const reviewsRouter = Router();
export const productReviewsRouter = Router();

reviewsRouter.get('/:reviewId', authenticate(), withAsync(findReviewDetail));
reviewsRouter.patch('/:reviewId', authenticate(), withAsync(updateReview));
reviewsRouter.delete('/:reviewId', authenticate(), withAsync(deleteReview));

productReviewsRouter.post(
  '/:productId/reviews',
  authenticate(),
  withAsync(createReview),
);
productReviewsRouter.get(
  '/:productId/reviews',
  authenticate(),
  withAsync(findProductReviews),
);
