import { prisma } from '../../lib/constants/prismaClient';
import { productInclude } from './queries/products.query';
import { NormalizedProductListQuery } from './types/products.type';
import {
  buildProductListOrderBy,
  buildProductListWhere,
} from './utils/products.repository.util';
import { isSoldOutByStocks } from './utils/products.util';

export class ProductsRepository {
  findSellerStore(sellerId: string) {
    return prisma.store.findUnique({
      where: { sellerId },
    });
  }

  findCategoryByName(name: string) {
    return prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }

  findById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: productInclude,
    });
  }

  findMany() {
    return prisma.product.findMany({
      include: productInclude,
    });
  }

  async findPageByQuery(query: NormalizedProductListQuery) {
    const where = buildProductListWhere(query);
    const orderBy = buildProductListOrderBy(query.sort);

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
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

  findFilteredByQuery(query: NormalizedProductListQuery) {
    const where = buildProductListWhere(query);
    return prisma.product.findMany({
      where,
      include: productInclude,
    });
  }

  create(data: {
    storeId: string;
    categoryId: string;
    name: string;
    price: number;
    content?: string;
    imageUrl?: string;
    imageKey?: string;
    discountRate?: number;
    discountStartTime?: Date;
    discountEndTime?: Date;
    stocks: Array<{ sizeId: number; quantity: number }>;
  }) {
    const isSoldOut = isSoldOutByStocks(data.stocks);

    return prisma.product.create({
      data: {
        storeId: data.storeId,
        categoryId: data.categoryId,
        name: data.name,
        price: data.price,
        content: data.content,
        imageUrl: data.imageUrl,
        imageKey: data.imageKey,
        discountRate: data.discountRate,
        discountStartTime: data.discountStartTime,
        discountEndTime: data.discountEndTime,
        isSoldOut,
        stocks: {
          create: data.stocks,
        },
      },
      include: productInclude,
    });
  }

  async update(
    productId: string,
    data: {
      categoryId?: string;
      name?: string;
      price?: number;
      content?: string;
      imageUrl?: string;
      imageKey?: string;
      discountRate?: number;
      discountStartTime?: Date | null;
      discountEndTime?: Date | null;
      stocks: Array<{ sizeId: number; quantity: number }>;
    },
  ) {
    const isSoldOut = isSoldOutByStocks(data.stocks);

    await prisma.$transaction([
      prisma.productStock.deleteMany({
        where: { productId },
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          ...(data.categoryId !== undefined
            ? { categoryId: data.categoryId }
            : {}),
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.content !== undefined ? { content: data.content } : {}),
          ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
          ...(data.imageKey !== undefined ? { imageKey: data.imageKey } : {}),
          ...(data.discountRate !== undefined
            ? { discountRate: data.discountRate }
            : {}),
          ...(data.discountStartTime !== undefined
            ? { discountStartTime: data.discountStartTime }
            : {}),
          ...(data.discountEndTime !== undefined
            ? { discountEndTime: data.discountEndTime }
            : {}),
          isSoldOut,
          stocks: {
            create: data.stocks,
          },
        },
      }),
    ]);

    return prisma.product.findUnique({
      where: { id: productId },
      include: productInclude,
    });
  }

  deleteById(productId: string) {
    return prisma.product.delete({
      where: { id: productId },
    });
  }

  createInquiry(data: {
    productId: string;
    buyerId: string;
    title: string;
    content: string;
    isSecret?: boolean;
  }) {
    return prisma.inquiry.create({
      data: {
        productId: data.productId,
        buyerId: data.buyerId,
        title: data.title,
        content: data.content,
        isSecret: data.isSecret ?? false,
      },
      include: {
        answer: true,
        buyer: true,
      },
    });
  }

  findProductInquiries(productId: string) {
    return prisma.inquiry.findMany({
      where: { productId },
      include: {
        answer: true,
        buyer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const productsRepository = new ProductsRepository();
