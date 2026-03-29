import * as s from 'superstruct';
import {
  nonEmptyString,
  booleanFromUnknown,
  nonNegativeNumberFromUnknown,
  numberFromUnknown,
  optionalNumberFromUnknown,
  positiveNumberFromUnknown,
} from '../../../lib/validation/struct-helpers';

const OptionalNoticeTextStruct = s.optional(
  s.refine(s.string(), 'OptionalNoticeText', (value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return true;
    return !['?', '-', 'n/a', 'na', 'none', 'null', 'undefined'].includes(
      normalized,
    );
  }),
);

const OptionalDateLikeStringStruct = s.optional(
  s.pattern(s.string(), /^\d{4}(?:[-/.])\d{1,2}(?:[-/.])\d{1,2}$/),
);

const OptionalPhoneLikeStringStruct = s.optional(
  s.pattern(s.string(), /^\d{2,4}-?\d{3,4}-?\d{4}$/),
);

export const ProductStockBodyStruct = s.type({
  sizeId: positiveNumberFromUnknown,
  quantity: nonNegativeNumberFromUnknown,
});

const ProductSizeSpecBodyStruct = s.type({
  sizeLabel: nonEmptyString,
  displayOrder: s.optional(nonNegativeNumberFromUnknown),
  totalLengthCm: s.optional(s.union([numberFromUnknown, s.literal(null)])),
  shoulderCm: s.optional(s.union([numberFromUnknown, s.literal(null)])),
  chestCm: s.optional(s.union([numberFromUnknown, s.literal(null)])),
  sleeveCm: s.optional(s.union([numberFromUnknown, s.literal(null)])),
  waistCm: s.optional(s.union([numberFromUnknown, s.literal(null)])),
  hipCm: s.optional(s.union([numberFromUnknown, s.literal(null)])),
  thighCm: s.optional(s.union([numberFromUnknown, s.literal(null)])),
  riseCm: s.optional(s.union([numberFromUnknown, s.literal(null)])),
  hemCm: s.optional(s.union([numberFromUnknown, s.literal(null)])),
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

const SizeSpecsStruct = s.coerce(
  s.array(ProductSizeSpecBodyStruct),
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
  material: OptionalNoticeTextStruct,
  color: OptionalNoticeTextStruct,
  manufacturerName: OptionalNoticeTextStruct,
  manufactureCountry: OptionalNoticeTextStruct,
  manufactureDate: OptionalDateLikeStringStruct,
  caution: OptionalNoticeTextStruct,
  qualityGuaranteeStandard: OptionalNoticeTextStruct,
  asManagerName: OptionalNoticeTextStruct,
  asPhoneNumber: OptionalPhoneLikeStringStruct,
  shippingFee: s.optional(nonNegativeNumberFromUnknown),
  extraShippingFee: s.optional(nonNegativeNumberFromUnknown),
  shippingCompany: OptionalNoticeTextStruct,
  deliveryPeriod: OptionalNoticeTextStruct,
  returnExchangePolicy: OptionalNoticeTextStruct,
  returnShippingFee: s.optional(nonNegativeNumberFromUnknown),
  exchangeShippingFee: s.optional(nonNegativeNumberFromUnknown),
  categoryName: nonEmptyString,
  stocks: s.size(StocksStruct, 1, Infinity),
  sizeSpecs: s.optional(SizeSpecsStruct),
  discountRate: s.optional(optionalNumberFromUnknown),
  discountStartTime: s.optional(s.string()),
  discountEndTime: s.optional(s.string()),
});

export const UpdateProductBodyStruct = s.type({
  name: s.optional(s.string()),
  price: s.optional(nonNegativeNumberFromUnknown),
  content: s.optional(s.string()),
  material: OptionalNoticeTextStruct,
  color: OptionalNoticeTextStruct,
  manufacturerName: OptionalNoticeTextStruct,
  manufactureCountry: OptionalNoticeTextStruct,
  manufactureDate: OptionalDateLikeStringStruct,
  caution: OptionalNoticeTextStruct,
  qualityGuaranteeStandard: OptionalNoticeTextStruct,
  asManagerName: OptionalNoticeTextStruct,
  asPhoneNumber: OptionalPhoneLikeStringStruct,
  shippingFee: s.optional(nonNegativeNumberFromUnknown),
  extraShippingFee: s.optional(nonNegativeNumberFromUnknown),
  shippingCompany: OptionalNoticeTextStruct,
  deliveryPeriod: OptionalNoticeTextStruct,
  returnExchangePolicy: OptionalNoticeTextStruct,
  returnShippingFee: s.optional(nonNegativeNumberFromUnknown),
  exchangeShippingFee: s.optional(nonNegativeNumberFromUnknown),
  categoryName: s.optional(nonEmptyString),
  stocks: s.size(StocksStruct, 1, Infinity),
  sizeSpecs: s.optional(SizeSpecsStruct),
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
