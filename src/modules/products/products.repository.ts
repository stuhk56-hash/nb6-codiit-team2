import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/constants/prismaClient';
import { productInclude } from './queries/products.query';
import type {
  CreateProductInquiryInput,
  CreateProductRecordInput,
  NormalizedProductListQuery,
  UpdateProductRecordInput,
} from './types/products.type';
import {
  buildProductListOrderBy,
  buildProductListWhere,
  toCreateProductData,
  toUpdateProductData,
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

  create(data: CreateProductRecordInput) {
    const isSoldOut = isSoldOutByStocks(data.stocks);

    return prisma.product.create({
      data: toCreateProductData(data, isSoldOut),
      include: productInclude,
    });
  }

  async update(productId: string, data: UpdateProductRecordInput) {
    const isSoldOut = isSoldOutByStocks(data.stocks);

    const operations: Prisma.PrismaPromise<unknown>[] = [
      prisma.productStock.deleteMany({
        where: { productId },
      }),
    ];
    if (data.sizeSpecs !== undefined) {
      operations.push(
        prisma.productSizeSpec.deleteMany({
          where: { productId },
        }),
      );
    }
    operations.push(
      prisma.product.update({
        where: { id: productId },
        data: toUpdateProductData(data, isSoldOut),
      }),
    );

    await prisma.$transaction(operations);

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

  createInquiry(data: CreateProductInquiryInput) {
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
