import * as s from 'superstruct';
import {
  nonEmptyString,
  optionalNumberFromUnknown,
  numberFromUnknown,
} from '../../../lib/validation/struct-helpers';

const ratingFromUnknown = s.refine(numberFromUnknown, 'rating', (value) => {
  return Number.isInteger(value) && value >= 1 && value <= 5;
});

export const ProductReviewParamsStruct = s.type({
  productId: nonEmptyString,
});

export const ReviewParamsStruct = s.type({
  reviewId: nonEmptyString,
});

export const ReviewListQueryStruct = s.type({
  page: optionalNumberFromUnknown,
  limit: optionalNumberFromUnknown,
});

export const CreateReviewBodyStruct = s.type({
  rating: ratingFromUnknown,
  content: nonEmptyString,
  orderItemId: nonEmptyString,
});

export const UpdateReviewBodyStruct = s.partial(
  s.type({
    rating: ratingFromUnknown,
    content: nonEmptyString,
  }),
);
