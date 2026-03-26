import { Prisma } from '@prisma/client';
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
    material?: string;
    color?: string;
    manufacturerName?: string;
    manufactureCountry?: string;
    manufactureDate?: string;
    caution?: string;
    qualityGuaranteeStandard?: string;
    asManagerName?: string;
    asPhoneNumber?: string;
    shippingFee?: number;
    extraShippingFee?: number;
    shippingCompany?: string;
    deliveryPeriod?: string;
    returnExchangePolicy?: string;
    returnShippingFee?: number;
    exchangeShippingFee?: number;
    imageUrl?: string;
    imageKey?: string;
    discountRate?: number;
    discountStartTime?: Date;
    discountEndTime?: Date;
    stocks: Array<{ sizeId: number; quantity: number }>;
    sizeSpecs?: Array<{
      sizeLabel: string;
      displayOrder?: number;
      totalLengthCm?: number | null;
      shoulderCm?: number | null;
      chestCm?: number | null;
      sleeveCm?: number | null;
      waistCm?: number | null;
      hipCm?: number | null;
      thighCm?: number | null;
      riseCm?: number | null;
      hemCm?: number | null;
    }>;
  }) {
    const isSoldOut = isSoldOutByStocks(data.stocks);

    return prisma.product.create({
      data: {
        storeId: data.storeId,
        categoryId: data.categoryId,
        name: data.name,
        price: data.price,
        content: data.content,
        material: data.material,
        color: data.color,
        manufacturerName: data.manufacturerName,
        manufactureCountry: data.manufactureCountry,
        manufactureDate: data.manufactureDate,
        caution: data.caution,
        qualityGuaranteeStandard: data.qualityGuaranteeStandard,
        asManagerName: data.asManagerName,
        asPhoneNumber: data.asPhoneNumber,
        shippingFee: data.shippingFee,
        extraShippingFee: data.extraShippingFee,
        shippingCompany: data.shippingCompany,
        deliveryPeriod: data.deliveryPeriod,
        returnExchangePolicy: data.returnExchangePolicy,
        returnShippingFee: data.returnShippingFee,
        exchangeShippingFee: data.exchangeShippingFee,
        imageUrl: data.imageUrl,
        imageKey: data.imageKey,
        discountRate: data.discountRate,
        discountStartTime: data.discountStartTime,
        discountEndTime: data.discountEndTime,
        isSoldOut,
        stocks: {
          create: data.stocks,
        },
        sizeSpecs: data.sizeSpecs?.length
          ? {
              create: data.sizeSpecs.map((spec, index) => ({
                ...spec,
                displayOrder: spec.displayOrder ?? index,
              })),
            }
          : undefined,
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
      material?: string;
      color?: string;
      manufacturerName?: string;
      manufactureCountry?: string;
      manufactureDate?: string;
      caution?: string;
      qualityGuaranteeStandard?: string;
      asManagerName?: string;
      asPhoneNumber?: string;
      shippingFee?: number;
      extraShippingFee?: number;
      shippingCompany?: string;
      deliveryPeriod?: string;
      returnExchangePolicy?: string;
      returnShippingFee?: number;
      exchangeShippingFee?: number;
      imageUrl?: string;
      imageKey?: string;
      discountRate?: number;
      discountStartTime?: Date | null;
      discountEndTime?: Date | null;
      stocks: Array<{ sizeId: number; quantity: number }>;
      sizeSpecs?: Array<{
        sizeLabel: string;
        displayOrder?: number;
        totalLengthCm?: number | null;
        shoulderCm?: number | null;
        chestCm?: number | null;
        sleeveCm?: number | null;
        waistCm?: number | null;
        hipCm?: number | null;
        thighCm?: number | null;
        riseCm?: number | null;
        hemCm?: number | null;
      }>;
    },
  ) {
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
        data: {
          ...(data.categoryId !== undefined
            ? { categoryId: data.categoryId }
            : {}),
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.content !== undefined ? { content: data.content } : {}),
          ...(data.material !== undefined ? { material: data.material } : {}),
          ...(data.color !== undefined ? { color: data.color } : {}),
          ...(data.manufacturerName !== undefined
            ? { manufacturerName: data.manufacturerName }
            : {}),
          ...(data.manufactureCountry !== undefined
            ? { manufactureCountry: data.manufactureCountry }
            : {}),
          ...(data.manufactureDate !== undefined
            ? { manufactureDate: data.manufactureDate }
            : {}),
          ...(data.caution !== undefined ? { caution: data.caution } : {}),
          ...(data.qualityGuaranteeStandard !== undefined
            ? { qualityGuaranteeStandard: data.qualityGuaranteeStandard }
            : {}),
          ...(data.asManagerName !== undefined
            ? { asManagerName: data.asManagerName }
            : {}),
          ...(data.asPhoneNumber !== undefined
            ? { asPhoneNumber: data.asPhoneNumber }
            : {}),
          ...(data.shippingFee !== undefined
            ? { shippingFee: data.shippingFee }
            : {}),
          ...(data.extraShippingFee !== undefined
            ? { extraShippingFee: data.extraShippingFee }
            : {}),
          ...(data.shippingCompany !== undefined
            ? { shippingCompany: data.shippingCompany }
            : {}),
          ...(data.deliveryPeriod !== undefined
            ? { deliveryPeriod: data.deliveryPeriod }
            : {}),
          ...(data.returnExchangePolicy !== undefined
            ? { returnExchangePolicy: data.returnExchangePolicy }
            : {}),
          ...(data.returnShippingFee !== undefined
            ? { returnShippingFee: data.returnShippingFee }
            : {}),
          ...(data.exchangeShippingFee !== undefined
            ? { exchangeShippingFee: data.exchangeShippingFee }
            : {}),
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
          ...(data.sizeSpecs !== undefined
            ? {
                sizeSpecs: {
                  create: data.sizeSpecs.map((spec, index) => ({
                    ...spec,
                    displayOrder: spec.displayOrder ?? index,
                  })),
                },
              }
            : {}),
        },
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
