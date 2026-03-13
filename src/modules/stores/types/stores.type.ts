import type { AuthenticatedRequest } from '../../../middlewares/authenticate';
import { Prisma } from '@prisma/client';
import type {
  myStoreInclude,
  myStoreProductInclude,
  storeInclude,
} from '../queries/stores.query';

export type StoresMulterRequest = AuthenticatedRequest & {
  file?: Express.Multer.File;
};

export type StoreWithCounts = Prisma.StoreGetPayload<{
  include: typeof storeInclude;
}>;

export type MyStoreWithRelations = Prisma.StoreGetPayload<{
  include: typeof myStoreInclude;
}>;

export type MyStoreProductRow = Prisma.ProductGetPayload<{
  include: typeof myStoreProductInclude;
}>;

export type StoreFavoriteWithStore = Prisma.StoreFavoriteGetPayload<{
  include: {
    store: {
      include: typeof storeInclude;
    };
  };
}>;

export type MyStoreProductsQuery = {
  page?: number;
  pageSize?: number;
};

export type NormalizedMyStoreProductsQuery = {
  page: number;
  pageSize: number;
};

export type UpdateStoreRecordInput = {
  name?: string;
  address?: string;
  detailAddress?: string;
  phoneNumber?: string;
  content?: string;
  imageUrl?: string;
  imageKey?: string;
};
