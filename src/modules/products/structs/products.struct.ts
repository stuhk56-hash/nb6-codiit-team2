import * as s from 'superstruct';
import {
  nonEmptyString,
  booleanFromUnknown,
  nonNegativeNumberFromUnknown,
  optionalNumberFromUnknown,
  positiveNumberFromUnknown,
} from '../../../lib/validation/struct-helpers';

export const ProductStockBodyStruct = s.type({
  sizeId: positiveNumberFromUnknown,
  quantity: nonNegativeNumberFromUnknown,
});

const StocksStruct = s.coerce(
  s.array(ProductStockBodyStruct),
  s.unknown(),
  (value) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return value;
  },
);

export const CreateProductBodyStruct = s.type({
  name: nonEmptyString,
  price: nonNegativeNumberFromUnknown,
  content: s.optional(s.string()),
  categoryName: nonEmptyString,
  stocks: s.size(StocksStruct, 1, Infinity),
  discountRate: s.optional(optionalNumberFromUnknown),
  discountStartTime: s.optional(s.string()),
  discountEndTime: s.optional(s.string()),
});

export const UpdateProductBodyStruct = s.type({
  name: s.optional(s.string()),
  price: s.optional(nonNegativeNumberFromUnknown),
  content: s.optional(s.string()),
  categoryName: s.optional(nonEmptyString),
  stocks: s.size(StocksStruct, 1, Infinity),
  discountRate: s.optional(optionalNumberFromUnknown),
  discountStartTime: s.optional(s.string()),
  discountEndTime: s.optional(s.string()),
  isSoldOut: s.optional(booleanFromUnknown),
});

export const ProductListQueryStruct = s.type({
  page: s.optional(positiveNumberFromUnknown),
  pageSize: s.optional(positiveNumberFromUnknown),
  search: s.optional(s.string()),
  sort: s.optional(
    s.enums([
      'mostReviewed',
      'recent',
      'lowPrice',
      'highPrice',
      'highRating',
      'salesRanking',
    ]),
  ),
  priceMin: s.optional(nonNegativeNumberFromUnknown),
  priceMax: s.optional(nonNegativeNumberFromUnknown),
  size: s.optional(s.string()),
  favoriteStore: s.optional(s.string()),
  categoryName: s.optional(s.string()),
});

export const CreateProductInquiryBodyStruct = s.type({
  title: nonEmptyString,
  content: nonEmptyString,
  isSecret: s.optional(booleanFromUnknown),
});

export const ProductInquiryListQueryStruct = s.type({
  page: s.optional(positiveNumberFromUnknown),
  pageSize: s.optional(positiveNumberFromUnknown),
  sort: s.optional(s.enums(['oldest', 'recent'])),
  status: s.optional(s.enums(['WaitingAnswer', 'CompletedAnswer'])),
});

export const ProductParamsStruct = s.type({
  productId: nonEmptyString,
});
