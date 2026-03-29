import type { AuthenticatedRequest } from '../../../middlewares/authenticate';
import { Prisma } from '@prisma/client';
import type {
  myStoreInclude,
  myStoreProductInclude,
  storeInclude,
} from '../queries/stores.query';
import type { CreateStoreDto, UpdateStoreDto } from '../dto/create-store.dto';

export type StoresMulterRequest = AuthenticatedRequest & {
  file?: Express.Multer.File;
};

export type UploadedStoreImage =
  | {
      url: string;
      key: string;
    }
  | null
  | undefined;

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
  businessRegistrationNumber?: string;
  businessPhoneNumber?: string;
  mailOrderSalesNumber?: string;
  representativeName?: string;
  businessAddress?: string;
  imageUrl?: string;
  imageKey?: string;
};

export type StoreBusinessInfoInput = {
  businessRegistrationNumber?: CreateStoreDto['businessRegistrationNumber'];
  businessPhoneNumber?: CreateStoreDto['businessPhoneNumber'];
  mailOrderSalesNumber?: CreateStoreDto['mailOrderSalesNumber'];
};

export type CreateStoreRecordInput = {
  sellerId: string;
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  businessRegistrationNumber?: string;
  businessPhoneNumber?: string;
  mailOrderSalesNumber?: string;
  representativeName?: string;
  businessAddress?: string;
  imageUrl?: string;
  imageKey?: string;
};

export type StoreBusinessInfoEncrypted = {
  businessRegistrationNumber: string | null;
  businessPhoneNumber: string | null;
  mailOrderSalesNumber: string | null;
  representativeName: string | null;
  businessAddress: string | null;
};
