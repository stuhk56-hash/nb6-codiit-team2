import { Prisma } from '@prisma/client';
import { NormalizedProductListQuery } from '../types/products.type';

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
