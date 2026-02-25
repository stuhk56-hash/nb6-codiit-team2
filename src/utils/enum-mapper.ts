// Enum-Mapper: Prisma enum과 API 값 매핑 유틸
/**
 * @index
 * 1) Prisma Enums
 * 2) inverse 헬퍼
 * 3) USER_TYPE_API_to_DB
 * 4) USER_TYPE_DB_to_API
 * 5) INQUIRY_STATUS_API_to_DB
 * 6) INQUIRY_STATUS_DB_to_API
 * 7) ORDER_STATUS_API_to_DB
 * 8) ORDER_STATUS_DB_to_API
 * 9) PAYMENT_STATUS_API_to_DB
 * 10) PAYMENT_STATUS_DB_to_API
 * 11) mapEnumValue
 */

// 1) Prisma Enums
import {
  UserType,
  InquiryStatus,
  OrderStatus,
  PaymentStatus,
} from '@prisma/client';

// 2) inverse 헬퍼
const inverse = <T extends Record<string, string | number>>(
  obj: T,
): Record<T[keyof T], keyof T> =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {} as Record<T[keyof T], keyof T>,
  );

// 3) USER_TYPE_API_to_DB
export const USER_TYPE_API_to_DB: Record<'seller' | 'buyer', UserType> = {
  seller: UserType.SELLER,
  buyer: UserType.BUYER,
};

// 4) USER_TYPE_DB_to_API
export const USER_TYPE_DB_to_API = inverse(USER_TYPE_API_to_DB);

// 5) INQUIRY_STATUS_API_to_DB
export const INQUIRY_STATUS_API_to_DB: Record<
  'waitingAnswer' | 'completedAnswer',
  InquiryStatus
> = {
  waitingAnswer: InquiryStatus.WaitingAnswer,
  completedAnswer: InquiryStatus.CompletedAnswer,
};

// 6) INQUIRY_STATUS_DB_to_API
export const INQUIRY_STATUS_DB_to_API = inverse(INQUIRY_STATUS_API_to_DB);

// 7) ORDER_STATUS_API_to_DB
export const ORDER_STATUS_API_to_DB: Record<
  'waitingPayment' | 'completedPayment' | 'canceled',
  OrderStatus
> = {
  waitingPayment: OrderStatus.WaitingPayment,
  completedPayment: OrderStatus.CompletedPayment,
  canceled: OrderStatus.Canceled,
};

// 8) ORDER_STATUS_DB_to_API
export const ORDER_STATUS_DB_to_API = inverse(ORDER_STATUS_API_to_DB);

// 9) PAYMENT_STATUS_API_to_DB
export const PAYMENT_STATUS_API_to_DB: Record<
  'pending' | 'paid' | 'failed' | 'canceled',
  PaymentStatus
> = {
  pending: PaymentStatus.Pending,
  paid: PaymentStatus.Paid,
  failed: PaymentStatus.Failed,
  canceled: PaymentStatus.Canceled,
};

// 10) PAYMENT_STATUS_DB_to_API
export const PAYMENT_STATUS_DB_to_API = inverse(PAYMENT_STATUS_API_to_DB);

// 11) mapEnumValue
export const mapEnumValue = <
  MapType extends Record<PropertyKey, PropertyKey>,
  Key extends keyof MapType,
>(
  map: MapType,
  value: Key | null | undefined,
): MapType[Key] | null | undefined => {
  if (value === undefined || value === null) return undefined;
  return map[value] ?? null;
};
