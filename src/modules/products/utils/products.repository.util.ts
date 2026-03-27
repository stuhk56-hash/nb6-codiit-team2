import { Prisma } from '@prisma/client';
import type {
  CreateProductRecordInput,
  NormalizedProductListQuery,
  UpdateProductRecordInput,
} from '../types/products.type';

export function buildProductListWhere(
  query: NormalizedProductListQuery,
): Prisma.ProductWhereInput {
  const normalizedSearch = query.search.trim();
  const normalizedCategory = query.categoryName.trim();
  const normalizedSize = query.size.trim();
  const normalizedFavoriteStore = query.favoriteStore.trim();
  const priceFilter: Prisma.IntFilter = {};

  if (query.priceMin > 0) {
    priceFilter.gte = query.priceMin;
  }

  if (query.priceMax < Number.MAX_SAFE_INTEGER) {
    priceFilter.lte = query.priceMax;
  }

  return {
    AND: [
      normalizedSearch
        ? {
            OR: [
              { name: { contains: normalizedSearch, mode: 'insensitive' } },
              {
                store: {
                  name: { contains: normalizedSearch, mode: 'insensitive' },
                },
              },
            ],
          }
        : {},
      normalizedCategory
        ? {
            category: {
              name: {
                equals: normalizedCategory,
                mode: 'insensitive',
              },
            },
          }
        : {},
      Object.keys(priceFilter).length ? { price: priceFilter } : {},
      normalizedSize
        ? {
            stocks: {
              some: {
                size: {
                  name: normalizedSize,
                },
              },
            },
          }
        : {},
      normalizedFavoriteStore
        ? {
            storeId: normalizedFavoriteStore,
          }
        : {},
    ],
  };
}

export function buildProductListOrderBy(
  sort: NormalizedProductListQuery['sort'],
):
  | Prisma.ProductOrderByWithRelationInput
  | Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'lowPrice':
      return { price: 'asc' };
    case 'highPrice':
      return { price: 'desc' };
    case 'mostReviewed':
      return [{ reviews: { _count: 'desc' } }, { createdAt: 'desc' }];
    case 'recent':
    default:
      return { createdAt: 'desc' };
  }
}

function toProductSizeSpecsCreateInput(
  sizeSpecs: UpdateProductRecordInput['sizeSpecs'] | CreateProductRecordInput['sizeSpecs'],
) {
  if (!sizeSpecs?.length) {
    return undefined;
  }

  return {
    create: sizeSpecs.map((spec, index) => ({
      ...spec,
      displayOrder: spec.displayOrder ?? index,
    })),
  };
}

export function toCreateProductData(
  data: CreateProductRecordInput,
  isSoldOut: boolean,
) {
  return {
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
    sizeSpecs: toProductSizeSpecsCreateInput(data.sizeSpecs),
  };
}

export function toUpdateProductData(
  data: UpdateProductRecordInput,
  isSoldOut: boolean,
) {
  return {
    ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
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
    ...(data.shippingFee !== undefined ? { shippingFee: data.shippingFee } : {}),
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
    ...(data.discountRate !== undefined ? { discountRate: data.discountRate } : {}),
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
          sizeSpecs: toProductSizeSpecsCreateInput(data.sizeSpecs),
        }
      : {}),
  };
}
