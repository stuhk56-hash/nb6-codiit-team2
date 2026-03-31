import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import { CreateProductDto, UpdateProductDto } from '../dto/create-product.dto';
import {
  NormalizedProductInquiryListQuery,
  NormalizedProductListQuery,
  ProductInquiryListQuery,
  ProductInquiryWithAnswer,
  ProductListQuery,
  ProductWithRelations,
} from '../types/products.type';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';

const DEFAULT_PRODUCT_LIST_PAGE = 1;
const DEFAULT_PRODUCT_LIST_PAGE_SIZE = 16;
const DEFAULT_PRODUCT_INQUIRY_LIST_PAGE = 1;
const DEFAULT_PRODUCT_INQUIRY_LIST_PAGE_SIZE = 10;
const MIN_SIZE_SPEC_CM = 0;
const MAX_SIZE_SPEC_CM = 300;

function validateDiscountRate(rate: number | undefined) {
  if (rate === undefined) {
    return;
  }

  if (rate < 0 || rate > 100) {
    throw new BadRequestError();
  }
}

function isValidDateString(value: string) {
  return !Number.isNaN(Date.parse(value));
}

function validateDateInput(value: string | undefined) {
  if (value === undefined || value === '') {
    return;
  }

  if (!isValidDateString(value)) {
    throw new BadRequestError();
  }
}

function validateDiscountPeriod(
  start: Date | null | undefined,
  end: Date | null | undefined,
) {
  const hasStart = start !== null && start !== undefined;
  const hasEnd = end !== null && end !== undefined;

  if (hasStart !== hasEnd) {
    throw new BadRequestError();
  }

  if (hasStart && hasEnd && start.getTime() > end.getTime()) {
    throw new BadRequestError();
  }
}

function toSizeGuideType(categoryName: string): 'TOP' | 'BOTTOM' | 'NONE' {
  const category = categoryName.trim().toLowerCase();
  if (category === 'top' || category === 'outer' || category === 'dress') {
    return 'TOP';
  }
  if (category === 'bottom' || category === 'skirt') {
    return 'BOTTOM';
  }
  return 'NONE';
}

function toNumericSizeSpecValues(spec: NonNullable<CreateProductDto['sizeSpecs']>[number]) {
  return [
    spec.totalLengthCm,
    spec.shoulderCm,
    spec.chestCm,
    spec.sleeveCm,
    spec.waistCm,
    spec.hipCm,
    spec.thighCm,
    spec.riseCm,
    spec.hemCm,
  ];
}

function validateSizeSpecs(
  categoryName: string,
  sizeSpecs: CreateProductDto['sizeSpecs'] | undefined,
) {
  const guideType = toSizeGuideType(categoryName);
  if (guideType === 'NONE') {
    return;
  }

  if (!sizeSpecs?.length) {
    throw new BadRequestError();
  }

  const labels = new Set<string>();
  for (const spec of sizeSpecs) {
    const label = spec.sizeLabel?.trim().toUpperCase();
    if (!label || labels.has(label)) {
      throw new BadRequestError();
    }
    labels.add(label);

    const numericValues = toNumericSizeSpecValues(spec);

    for (const value of numericValues) {
      if (value === undefined || value === null) {
        continue;
      }

      if (
        !Number.isFinite(value) ||
        value <= MIN_SIZE_SPEC_CM ||
        value > MAX_SIZE_SPEC_CM
      ) {
        throw new BadRequestError();
      }
    }
  }
}

export function validateCreateProductInput(data: CreateProductDto) {
  if (!data.name || !data.categoryName || !data.stocks.length) {
    throw new BadRequestError();
  }

  validateDiscountRate(data.discountRate);
  validateDateInput(data.discountStartTime);
  validateDateInput(data.discountEndTime);

  const start = data.discountStartTime
    ? new Date(data.discountStartTime)
    : undefined;
  const end = data.discountEndTime ? new Date(data.discountEndTime) : undefined;
  validateDiscountPeriod(start, end);
  validateSizeSpecs(data.categoryName, data.sizeSpecs);
}

export function validateUpdateProductInput(
  data: UpdateProductDto,
  currentProduct: ProductWithRelations,
) {
  if (!data.stocks?.length) {
    throw new BadRequestError();
  }

  validateDiscountRate(data.discountRate);
  validateDateInput(data.discountStartTime);
  validateDateInput(data.discountEndTime);

  const nextStart =
    data.discountStartTime !== undefined
      ? data.discountStartTime
        ? new Date(data.discountStartTime)
        : null
      : currentProduct.discountStartTime;
  const nextEnd =
    data.discountEndTime !== undefined
      ? data.discountEndTime
        ? new Date(data.discountEndTime)
        : null
      : currentProduct.discountEndTime;

  validateDiscountPeriod(nextStart, nextEnd);

  const nextCategory = data.categoryName ?? currentProduct.category.name;
  validateSizeSpecs(nextCategory, data.sizeSpecs);
}

export function normalizeProductStocksInput(
  stocks: CreateProductDto['stocks'],
  sizes: Array<{ id: number; name: string }>,
) {
  const sizeIdsInDb = new Set(sizes.map((size) => size.id));
  const sizeIdByName = new Map(
    sizes.map((size) => [size.name.toUpperCase(), size.id]),
  );

  return stocks.map((stock) => {
    if (sizeIdsInDb.has(stock.sizeId)) {
      return {
        sizeId: stock.sizeId,
        quantity: stock.quantity,
      };
    }

    const normalizedName = stock.sizeName?.trim().toUpperCase();
    if (normalizedName) {
      const resolved = sizeIdByName.get(normalizedName);
      if (resolved) {
        return {
          sizeId: resolved,
          quantity: stock.quantity,
        };
      }
    }

    throw new BadRequestError('잘못된 사이즈 정보입니다.');
  });
}

export function toProductStockLookupKeys(stocks: CreateProductDto['stocks']) {
  const sizeIds = Array.from(new Set(stocks.map((stock) => stock.sizeId)));
  const sizeNames = Array.from(
    new Set(
      stocks
        .map((stock) => stock.sizeName?.trim().toUpperCase())
        .filter((name): name is string => Boolean(name)),
    ),
  );

  return {
    sizeIds,
    sizeNames,
  };
}

export function requireProduct(
  product: ProductWithRelations | null,
): ProductWithRelations {
  if (!product) {
    throw new NotFoundError('상품을 찾을 수 없습니다.');
  }

  return product;
}

export function requireProducts(products: ProductWithRelations[]) {
  if (!products.length) {
    throw new NotFoundError('상품을 찾을 수 없습니다.');
  }
}

export function ensureSellerStore(storeId: string | undefined) {
  if (!storeId) {
    throw new NotFoundError('스토어를 찾을 수 없습니다.');
  }
}

export function ensureCategory(categoryId: string | undefined) {
  if (!categoryId) {
    throw new NotFoundError('카테고리가 없습니다.');
  }
}

export function ensureProductOwner(
  sellerId: string,
  product: ProductWithRelations,
) {
  if (product.store.sellerId !== sellerId) {
    throw new ForbiddenError('권한이 없습니다.');
  }
}

export function normalizeProductListQuery(
  query: ProductListQuery,
): NormalizedProductListQuery {
  return {
    page:
      query.page && query.page > 0 ? query.page : DEFAULT_PRODUCT_LIST_PAGE,
    pageSize:
      query.pageSize && query.pageSize > 0
        ? query.pageSize
        : DEFAULT_PRODUCT_LIST_PAGE_SIZE,
    search: query.search ?? '',
    sort: query.sort ?? 'recent',
    priceMin: query.priceMin ?? 0,
    priceMax: query.priceMax ?? Number.MAX_SAFE_INTEGER,
    size: query.size ?? '',
    favoriteStore: query.favoriteStore ?? '',
    categoryName: query.categoryName ?? '',
  };
}

export function normalizeProductInquiryListQuery(
  query: ProductInquiryListQuery,
): NormalizedProductInquiryListQuery {
  return {
    page:
      query.page && query.page > 0
        ? query.page
        : DEFAULT_PRODUCT_INQUIRY_LIST_PAGE,
    pageSize:
      query.pageSize && query.pageSize > 0
        ? query.pageSize
        : DEFAULT_PRODUCT_INQUIRY_LIST_PAGE_SIZE,
    sort: query.sort ?? 'recent',
    status: query.status ?? '',
  };
}

export function filterProducts(
  products: ProductWithRelations[],
  query: NormalizedProductListQuery,
) {
  const normalizedCategory = query.categoryName.trim().toLowerCase();
  const normalizedSearch = query.search.trim().toLowerCase();

  return products.filter((product) => {
    if (
      normalizedSearch &&
      !product.name.trim().toLowerCase().includes(normalizedSearch) &&
      !product.store.name.trim().toLowerCase().includes(normalizedSearch)
    ) {
      return false;
    }

    if (
      normalizedCategory &&
      product.category.name.trim().toLowerCase() !== normalizedCategory
    ) {
      return false;
    }

    if (product.price < query.priceMin || product.price > query.priceMax) {
      return false;
    }

    if (
      query.size &&
      !product.stocks.some((stock) => stock.size.name === query.size)
    ) {
      return false;
    }

    if (query.favoriteStore && product.storeId !== query.favoriteStore) {
      return false;
    }

    return true;
  });
}

export function sortProducts(
  products: ProductWithRelations[],
  sort: NormalizedProductListQuery['sort'],
) {
  return [...products].sort((a, b) => {
    switch (sort) {
      case 'lowPrice':
        return a.price - b.price;
      case 'highPrice':
        return b.price - a.price;
      case 'mostReviewed':
        return b.reviews.length - a.reviews.length;
      case 'highRating': {
        const aRating =
          a.reviews.reduce((sum, review) => sum + review.rating, 0) /
          (a.reviews.length || 1);
        const bRating =
          b.reviews.reduce((sum, review) => sum + review.rating, 0) /
          (b.reviews.length || 1);
        return bRating - aRating;
      }
      case 'salesRanking': {
        const aSales = a.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const bSales = b.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        return bSales - aSales;
      }
      case 'recent':
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });
}

export function paginateProducts(
  products: ProductWithRelations[],
  query: Pick<NormalizedProductListQuery, 'page' | 'pageSize'>,
) {
  const start = (query.page - 1) * query.pageSize;
  return products.slice(start, start + query.pageSize);
}

export function filterProductInquiries(
  inquiries: ProductInquiryWithAnswer[],
  status: NormalizedProductInquiryListQuery['status'],
) {
  if (!status) {
    return inquiries;
  }

  return inquiries.filter((inquiry) => inquiry.status === status);
}

export function sortProductInquiries(
  inquiries: ProductInquiryWithAnswer[],
  sort: NormalizedProductInquiryListQuery['sort'],
) {
  return [...inquiries].sort((a, b) =>
    sort === 'oldest'
      ? a.createdAt.getTime() - b.createdAt.getTime()
      : b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export function paginateProductInquiries(
  inquiries: ProductInquiryWithAnswer[],
  query: Pick<NormalizedProductInquiryListQuery, 'page' | 'pageSize'>,
) {
  const start = (query.page - 1) * query.pageSize;
  return inquiries.slice(start, start + query.pageSize);
}

export async function resolveProductImage(product: ProductWithRelations) {
  product.imageUrl = await resolveS3ImageUrl(
    product.imageUrl,
    product.imageKey,
    '/images/Mask-group.svg',
  );

  return product;
}

export async function resolveProductsImage(products: ProductWithRelations[]) {
  await Promise.all(products.map(resolveProductImage));
  return products;
}
