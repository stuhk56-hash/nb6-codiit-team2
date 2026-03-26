import { prisma } from '../../lib/constants/prismaClient';
import {
  myStoreInclude,
  myStoreProductInclude,
  storeInclude,
} from './queries/stores.query';
import type {
  NormalizedMyStoreProductsQuery,
  UpdateStoreRecordInput,
} from './types/stores.type';

export class StoresRepository {
  findBySellerId(sellerId: string) {
    return prisma.store.findUnique({
      where: { sellerId },
      include: storeInclude,
    });
  }

  findMyStoreBySellerId(sellerId: string) {
    return prisma.store.findUnique({
      where: { sellerId },
      include: myStoreInclude,
    });
  }

  findById(storeId: string) {
    return prisma.store.findUnique({
      where: { id: storeId },
      include: storeInclude,
    });
  }

  create(data: {
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
  }) {
    return prisma.store.create({
      data,
      include: storeInclude,
    });
  }

  update(storeId: string, data: UpdateStoreRecordInput) {
    return prisma.store.update({
      where: { id: storeId },
      data,
      include: storeInclude,
    });
  }

  async findMyProductsBySellerId(
    sellerId: string,
    query: NormalizedMyStoreProductsQuery,
  ) {
    const where = {
      store: {
        sellerId,
      },
    };

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: myStoreProductInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.product.count({
        where,
      }),
    ]);

    return {
      products,
      totalCount,
    };
  }

  async registerFavorite(userId: string, storeId: string) {
    await prisma.storeFavorite.create({
      data: {
        userId,
        storeId,
      },
    });

    return this.findById(storeId);
  }

  async deleteFavorite(userId: string, storeId: string) {
    await prisma.storeFavorite.delete({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    return this.findById(storeId);
  }
}

export const storesRepository = new StoresRepository();
