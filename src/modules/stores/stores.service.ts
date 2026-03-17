import type { FavoriteStoreDeleteResponseDto } from './dto/favorite-store-delete-response.dto';
import type { FavoriteStoreRegisterResponseDto } from './dto/favorite-store-register-response.dto';
import type { MyStoreProductResponseDto } from './dto/my-store-product-response.dto';
import type { MyStoreResponseDto } from './dto/my-store-response.dto';
import type {
  StoreDetailResponseDto,
  StoreResponseDto,
} from './dto/store-response.dto';
import { s3Service } from '../s3/s3.service';
import { storesRepository } from './stores.repository';
import type { MyStoreProductsQuery } from './types/stores.type';
import {
  toFavoriteStoreDeleteResponseDto,
  toFavoriteStoreRegisterResponseDto,
  toMyStoreProductResponseDto,
  toMyStoreResponseDto,
  toStoreDetailResponseDto,
  toStoreResponseDto,
} from './utils/stores.mapper';
import {
  ensureSellerStoreMissing,
  ensureStoreOwner,
  ensureStoreUpdateInput,
  normalizeMyStoreProductsQuery,
  resolveMyStoreProductImages,
  resolveStoreImage,
  requireMyStore,
  requireStore,
} from './utils/stores.service.util';

export class StoresService {
  async create(
    sellerId: string,
    data: {
      name: string;
      address: string;
      detailAddress: string;
      phoneNumber: string;
      content: string;
    },
    image?: Express.Multer.File,
  ): Promise<StoreResponseDto> {
    const existing = await storesRepository.findBySellerId(sellerId);
    ensureSellerStoreMissing(existing);
    const uploadedImage = image ? await s3Service.uploadFile(image) : null;

    const store = await storesRepository.create({
      sellerId,
      ...data,
      ...(uploadedImage
        ? {
            imageUrl: uploadedImage.url,
            imageKey: uploadedImage.key,
          }
        : {}),
    });

    const resolvedStore = await resolveStoreImage(store);
    return toStoreResponseDto(resolvedStore);
  }

  async update(
    sellerId: string,
    storeId: string,
    data: {
      name?: string;
      address?: string;
      detailAddress?: string;
      phoneNumber?: string;
      content?: string;
    },
    image?: Express.Multer.File,
  ): Promise<StoreResponseDto> {
    ensureStoreUpdateInput(data, image);
    const store = requireStore(await storesRepository.findById(storeId));
    ensureStoreOwner(sellerId, { userId: store.sellerId });
    const uploadedImage = image ? await s3Service.uploadFile(image) : null;

    const updated = await storesRepository.update(storeId, {
      ...data,
      ...(uploadedImage
        ? {
            imageUrl: uploadedImage.url,
            imageKey: uploadedImage.key,
          }
        : {}),
    });

    const resolvedStore = await resolveStoreImage(updated);
    return toStoreResponseDto(resolvedStore);
  }

  async findStore(storeId: string): Promise<StoreDetailResponseDto> {
    const store = requireStore(await storesRepository.findById(storeId));
    const resolvedStore = await resolveStoreImage(store);
    return toStoreDetailResponseDto(resolvedStore);
  }

  async myStore(sellerId: string): Promise<MyStoreResponseDto> {
    const store = requireMyStore(
      await storesRepository.findMyStoreBySellerId(sellerId),
    );
    const resolvedStore = await resolveStoreImage(store);
    return toMyStoreResponseDto(resolvedStore);
  }

  async myStoreProduct(
    sellerId: string,
    query: MyStoreProductsQuery,
  ): Promise<MyStoreProductResponseDto> {
    requireMyStore(await storesRepository.findMyStoreBySellerId(sellerId));
    const normalized = normalizeMyStoreProductsQuery(query);
    const { products, totalCount } =
      await storesRepository.findMyProductsBySellerId(sellerId, normalized);
    const resolvedProducts = await resolveMyStoreProductImages(products);

    return toMyStoreProductResponseDto(resolvedProducts, totalCount);
  }

  async favoriteStoreRegister(
    userId: string,
    storeId: string,
  ): Promise<FavoriteStoreRegisterResponseDto> {
    requireStore(await storesRepository.findById(storeId));
    const store = requireStore(
      await storesRepository.registerFavorite(userId, storeId),
    );
    const resolvedStore = await resolveStoreImage(store);
    return toFavoriteStoreRegisterResponseDto(resolvedStore);
  }

  async favoriteStoreDelete(
    userId: string,
    storeId: string,
  ): Promise<FavoriteStoreDeleteResponseDto> {
    requireStore(await storesRepository.findById(storeId));
    const store = requireStore(
      await storesRepository.deleteFavorite(userId, storeId),
    );
    const resolvedStore = await resolveStoreImage(store);
    return toFavoriteStoreDeleteResponseDto(resolvedStore);
  }
}

export const storesService = new StoresService();
