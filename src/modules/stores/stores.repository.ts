import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/constants/prismaClient';
import {
  myStoreInclude,
  myStoreProductInclude,
  storeInclude,
} from './queries/stores.query';
import type {
  CreateStoreRecordInput,
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

  create(data: CreateStoreRecordInput) {
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

  createAuditLog(data: {
    storeId: string;
    sellerId: string;
    action: 'CREATED' | 'UPDATED';
    before?: Prisma.InputJsonValue | null;
    after: Prisma.InputJsonValue;
  }) {
    return prisma.storeAuditLog.create({
      data: {
        storeId: data.storeId,
        sellerId: data.sellerId,
        action: data.action,
        before: data.before ?? null,
        after: data.after,
      },
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
