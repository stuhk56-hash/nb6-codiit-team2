import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import type {
  MyStoreProductRow,
  MyStoreProductsQuery,
  MyStoreWithRelations,
  NormalizedMyStoreProductsQuery,
  StoreBusinessInfoInput,
  StoreWithCounts,
} from '../types/stores.type';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';
import {
  DEFAULT_MY_STORE_PRODUCTS_PAGE,
  DEFAULT_MY_STORE_PRODUCTS_PAGE_SIZE,
} from './stores.util';

export function normalizeMyStoreProductsQuery(
  query: MyStoreProductsQuery,
): NormalizedMyStoreProductsQuery {
  return {
    page:
      query.page && query.page > 0
        ? query.page
        : DEFAULT_MY_STORE_PRODUCTS_PAGE,
    pageSize:
      query.pageSize && query.pageSize > 0
        ? query.pageSize
        : DEFAULT_MY_STORE_PRODUCTS_PAGE_SIZE,
  };
}

export function requireStore(store: StoreWithCounts | null): StoreWithCounts {
  if (!store) {
    throw new NotFoundError('요청한 리소스를 찾을 수 없습니다.');
  }

  return store;
}

export function requireMyStore(
  store: MyStoreWithRelations | null,
): MyStoreWithRelations {
  if (!store) {
    throw new NotFoundError('요청한 리소스를 찾을 수 없습니다.');
  }

  return store;
}

export function ensureSellerStoreMissing(store: StoreWithCounts | null) {
  if (store) {
    throw new ConflictError();
  }
}

export function ensureStoreOwner(userId: string, store: { userId: string }) {
  if (store.userId !== userId) {
    throw new ForbiddenError('권한이 없습니다.');
  }
}

export function ensureStoreUpdateInput(
  data: Record<string, unknown>,
  image?: Express.Multer.File,
) {
  const hasBody = Object.values(data).some((value) => value !== undefined);
  if (!hasBody && !image) {
    throw new BadRequestError('수정할 항목이 없습니다.');
  }
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '');
}

function isValidBusinessRegistrationNumber(value: string) {
  const digits = normalizeDigits(value);
  if (!/^\d{10}$/.test(digits)) {
    return false;
  }

  const numbers = digits.split('').map(Number);
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  const weightedSum = weights.reduce(
    (sum, weight, index) => sum + numbers[index] * weight,
    0,
  );
  const carry = Math.floor((numbers[8] * 5) / 10);
  const checksum = (10 - ((weightedSum + carry) % 10)) % 10;

  return checksum === numbers[9];
}

function isValidBusinessPhoneNumber(value: string) {
  const digits = normalizeDigits(value);
  // 지역번호/대표번호/휴대폰 번호를 폭넓게 허용
  return /^\d{8,11}$/.test(digits);
}

function isValidMailOrderSalesNumber(value: string) {
  const normalized = value.trim();
  // 예: 2024-서울강남-1234, 2025-경기성남-00012
  return /^\d{4}-[A-Za-z0-9가-힣]+-\d{4,6}$/.test(normalized);
}

export function ensureStoreBusinessInfoValidity(data: StoreBusinessInfoInput) {
  if (
    data.businessRegistrationNumber !== undefined &&
    !isValidBusinessRegistrationNumber(data.businessRegistrationNumber)
  ) {
    throw new BadRequestError(
      '사업자등록번호를 확인해주세요. 숫자 10자리(예: 123-45-67890) 형식이어야 합니다.',
    );
  }

  if (
    data.businessPhoneNumber !== undefined &&
    !isValidBusinessPhoneNumber(data.businessPhoneNumber)
  ) {
    throw new BadRequestError(
      '사업자 연락처를 확인해주세요. 숫자 8~11자리(예: 02-1234-5678) 형식이어야 합니다.',
    );
  }

  if (
    data.mailOrderSalesNumber !== undefined &&
    !isValidMailOrderSalesNumber(data.mailOrderSalesNumber)
  ) {
    throw new BadRequestError(
      '통신판매업 신고번호를 확인해주세요. 예: 2024-서울강남-1234',
    );
  }
}

export async function resolveStoreImage<T extends StoreWithCounts>(store: T) {
  store.imageUrl = await resolveS3ImageUrl(
    store.imageUrl,
    store.imageKey,
    '/images/Mask-group.svg',
  );

  return store;
}

export async function resolveMyStoreProductImages(products: MyStoreProductRow[]) {
  await Promise.all(
    products.map(async function (product) {
      product.imageUrl = await resolveS3ImageUrl(
        product.imageUrl,
        product.imageKey,
        '/images/Mask-group.svg',
      );
    }),
  );

  return products;
}
