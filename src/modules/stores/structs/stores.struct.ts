import * as s from 'superstruct';
import {
  nonEmptyString,
  optionalNumberFromUnknown,
} from '../../../lib/validation/struct-helpers';

export const CreateStoreBodyStruct = s.type({
  name: nonEmptyString,
  address: nonEmptyString,
  detailAddress: nonEmptyString,
  phoneNumber: nonEmptyString,
  content: nonEmptyString,
  businessRegistrationNumber: s.optional(nonEmptyString),
  businessPhoneNumber: s.optional(nonEmptyString),
  mailOrderSalesNumber: s.optional(nonEmptyString),
  representativeName: s.optional(nonEmptyString),
  businessAddress: s.optional(nonEmptyString),
});

export const UpdateStoreBodyStruct = s.partial(
  s.type({
    name: nonEmptyString,
    address: nonEmptyString,
    detailAddress: nonEmptyString,
    phoneNumber: nonEmptyString,
    content: nonEmptyString,
    businessRegistrationNumber: nonEmptyString,
    businessPhoneNumber: nonEmptyString,
    mailOrderSalesNumber: nonEmptyString,
    representativeName: nonEmptyString,
    businessAddress: nonEmptyString,
  }),
);

export const StoreParamsStruct = s.type({
  storeId: nonEmptyString,
});

export const MyStoreProductsQueryStruct = s.type({
  page: optionalNumberFromUnknown,
  pageSize: optionalNumberFromUnknown,
});
