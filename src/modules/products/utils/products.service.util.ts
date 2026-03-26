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

function ensureValidDiscountRate(rate: number | undefined) {
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

function ensureValidDateInput(value: string | undefined) {
  if (value === undefined || value === '') {
    return;
  }

  if (!isValidDateString(value)) {
    throw new BadRequestError();
  }
}

function ensureValidDiscountPeriod(
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

function getSizeGuideType(categoryName: string): 'TOP' | 'BOTTOM' | 'NONE' {
  const category = categoryName.trim().toLowerCase();
  if (category === 'top' || category === 'outer' || category === 'dress') {
    return 'TOP';
  }
  if (category === 'bottom' || category === 'skirt') {
    return 'BOTTOM';
  }
  return 'NONE';
}

function validateSizeSpecs(
  categoryName: string,
  sizeSpecs: CreateProductDto['sizeSpecs'] | undefined,
) {
  const guideType = getSizeGuideType(categoryName);
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
  }
}

export function validateCreateProductInput(data: CreateProductDto) {
  if (!data.name || !data.categoryName || !data.stocks.length) {
    throw new BadRequestError();
  }

  ensureValidDiscountRate(data.discountRate);
  ensureValidDateInput(data.discountStartTime);
  ensureValidDateInput(data.discountEndTime);

  const start = data.discountStartTime
    ? new Date(data.discountStartTime)
    : undefined;
  const end = data.discountEndTime ? new Date(data.discountEndTime) : undefined;
  ensureValidDiscountPeriod(start, end);
  validateSizeSpecs(data.categoryName, data.sizeSpecs);
}

export function validateUpdateProductInput(
  data: UpdateProductDto,
  currentProduct: ProductWithRelations,
) {
  if (!data.stocks?.length) {
    throw new BadRequestError();
  }

  ensureValidDiscountRate(data.discountRate);
  ensureValidDateInput(data.discountStartTime);
  ensureValidDateInput(data.discountEndTime);

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

  ensureValidDiscountPeriod(nextStart, nextEnd);

  const nextCategory = data.categoryName ?? currentProduct.category.name;
  validateSizeSpecs(nextCategory, data.sizeSpecs);
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
    page: query.page && query.page > 0 ? query.page : 1,
    pageSize: query.pageSize && query.pageSize > 0 ? query.pageSize : 16,
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
    page: query.page && query.page > 0 ? query.page : 1,
    pageSize: query.pageSize && query.pageSize > 0 ? query.pageSize : 10,
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
        //sort에서 비교 함수는 보통 음수면 a가 앞 양수면 b가 앞 0이면 순서 유지, 여기서는 highRating이므로 bRating - aRating으로 내림차순 정렬
        //reduce는 배열의 여러 값을 하나로 누적해서 만드는 메서드, 리뷰의 배열을 돌면서 각 리뷰의 rating을 전부 더함, 그리고 리뷰의 개수로 나눠서 평균 평점을 구함
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
  //slice는 배열의 일부를 잘라서 새 배열로 반환(위치:인덱스로 잘라내는 것) 배열에서 몇 번째부터 몇 번째 전까지 가져올지를 정함
  //시작 인덱스는 포함하지만 끝인덱스는 포함하지 않음 ex) arr.slice(0, 10)   // 0~9
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
