import type { FavoriteStoreDeleteResponseDto } from '../dto/favorite-store-delete-response.dto';
import type { FavoriteStoreRegisterResponseDto } from '../dto/favorite-store-register-response.dto';
import type { MyStoreProductResponseDto } from '../dto/my-store-product-response.dto';
import type { MyStoreProductDto } from '../dto/my-store-product.dto';
import type { MyStoreResponseDto } from '../dto/my-store-response.dto';
import type {
  StoreDetailResponseDto,
  StoreResponseDto,
} from '../dto/store-response.dto';
import type {
  MyStoreProductRow,
  MyStoreWithRelations,
  StoreWithCounts,
} from '../types/stores.type';
import { isDiscountActive } from '../../products/utils/products.util';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';

export async function toStoreResponseDto(
  store: StoreWithCounts,
): Promise<StoreResponseDto> {
  return {
    id: store.id,
    name: store.name,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
    userId: store.sellerId,
    address: store.address,
    detailAddress: store.detailAddress,
    phoneNumber: store.phoneNumber,
    content: store.content,
    image: await resolveS3ImageUrl(
      store.imageUrl,
      store.imageKey,
      '/images/Mask-group.svg',
    ),
  };
}

export async function toStoreDetailResponseDto(
  store: StoreWithCounts,
): Promise<StoreDetailResponseDto> {
  return {
    ...(await toStoreResponseDto(store)),
    favoriteCount: store._count.favoritedBy,
  };
}

export async function toMyStoreResponseDto(
  store: MyStoreWithRelations,
): Promise<MyStoreResponseDto> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthFavoriteCount = store.favoritedBy.filter(
    (favorite) => favorite.createdAt >= startOfMonth,
  ).length;

  const totalSoldCount = store.products.reduce(
    (sum, product) =>
      sum +
      product.orderItems.reduce((count, item) => count + item.quantity, 0),
    0,
  );

  return {
    id: store.id,
    name: store.name,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
    userId: store.sellerId,
    address: store.address,
    detailAddress: store.detailAddress,
    phoneNumber: store.phoneNumber,
    content: store.content,
    image: await resolveS3ImageUrl(
      store.imageUrl,
      store.imageKey,
      '/images/Mask-group.svg',
    ),
    productCount: store._count.products,
    favoriteCount: store._count.favoritedBy,
    monthFavoriteCount,
    totalSoldCount,
  };
}

export async function toMyStoreProductDto(
  product: MyStoreProductRow,
): Promise<MyStoreProductDto> {
  return {
    id: product.id,
    image: await resolveS3ImageUrl(
      product.imageUrl,
      product.imageKey,
      '/images/Mask-group.svg',
    ),
    name: product.name,
    price: product.price,
    stock: product.stocks.reduce((sum, stock) => sum + stock.quantity, 0),
    isDiscount: isDiscountActive(
      product.discountRate,
      product.discountStartTime,
      product.discountEndTime,
    ),
    createdAt: product.createdAt.toISOString(),
    isSoldOut: product.isSoldOut,
  };
}

export async function toMyStoreProductResponseDto(
  products: MyStoreProductRow[],
  totalCount: number,
): Promise<MyStoreProductResponseDto> {
  return {
    list: await Promise.all(products.map(toMyStoreProductDto)),
    totalCount,
  };
}

export async function toFavoriteStoreRegisterResponseDto(
  store: StoreWithCounts,
): Promise<FavoriteStoreRegisterResponseDto> {
  return {
    type: 'register',
    store: await toStoreResponseDto(store),
  };
}

export async function toFavoriteStoreDeleteResponseDto(
  store: StoreWithCounts,
): Promise<FavoriteStoreDeleteResponseDto> {
  return {
    type: 'delete',
    store: await toStoreResponseDto(store),
  };
}
