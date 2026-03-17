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

function toRequiredImage(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return '/images/Mask-group.svg';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '/images/Mask-group.svg';
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  return '/images/Mask-group.svg';
}

export function toStoreResponseDto(store: StoreWithCounts): StoreResponseDto {
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
    image: toRequiredImage(store.imageUrl),
  };
}

export function toStoreDetailResponseDto(
  store: StoreWithCounts,
): StoreDetailResponseDto {
  return {
    ...toStoreResponseDto(store),
    favoriteCount: store._count.favoritedBy,
  };
}

export function toMyStoreResponseDto(
  store: MyStoreWithRelations,
): MyStoreResponseDto {
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
    image: toRequiredImage(store.imageUrl),
    productCount: store._count.products,
    favoriteCount: store._count.favoritedBy,
    monthFavoriteCount,
    totalSoldCount,
  };
}

export function toMyStoreProductDto(product: MyStoreProductRow): MyStoreProductDto {
  return {
    id: product.id,
    image: toRequiredImage(product.imageUrl),
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

export function toMyStoreProductResponseDto(
  products: MyStoreProductRow[],
  totalCount: number,
): MyStoreProductResponseDto {
  return {
    list: products.map(toMyStoreProductDto),
    totalCount,
  };
}

export function toFavoriteStoreRegisterResponseDto(
  store: StoreWithCounts,
): FavoriteStoreRegisterResponseDto {
  return {
    type: 'register',
    store: toStoreResponseDto(store),
  };
}

export function toFavoriteStoreDeleteResponseDto(
  store: StoreWithCounts,
): FavoriteStoreDeleteResponseDto {
  return {
    type: 'delete',
    store: toStoreResponseDto(store),
  };
}
