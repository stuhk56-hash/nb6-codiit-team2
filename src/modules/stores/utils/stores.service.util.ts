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
    throw new BadRequestError();
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
