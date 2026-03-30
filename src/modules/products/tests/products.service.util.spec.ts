import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';
import {
  ensureProductOwner,
  filterProductInquiries,
  normalizeProductStocksInput,
  normalizeProductInquiryListQuery,
  normalizeProductListQuery,
  paginateProductInquiries,
  paginateProducts,
  requireProduct,
  resolveProductImage,
  sortProductInquiries,
  sortProducts,
  toProductStockLookupKeys,
  validateCreateProductInput,
  validateUpdateProductInput,
} from '../utils/products.service.util';
import {
  toCreateProductPayload,
  toUpdateProductPayload,
} from '../utils/products.payload.util';

jest.mock('../../s3/utils/s3.service.util', () => ({
  resolveS3ImageUrl: jest.fn(),
}));

function createProduct(partial: Partial<any> = {}) {
  const baseDate = new Date('2026-03-17T00:00:00.000Z');

  return {
    id: 'product-1',
    storeId: 'store-1',
    store: { sellerId: 'seller-1', name: '스토어' },
    category: { id: 'cat-1', name: 'top' },
    name: '상품',
    price: 1000,
    content: '설명',
    imageUrl: null,
    imageKey: null,
    discountRate: null,
    discountStartTime: null,
    discountEndTime: null,
    isSoldOut: false,
    stocks: [{ size: { name: 'M' }, quantity: 10 }],
    reviews: [],
    inquiries: [],
    orderItems: [],
    createdAt: baseDate,
    updatedAt: baseDate,
    ...partial,
  } as any;
}

describe('상품 서비스 유틸 유닛 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateProductInput', () => {
    test('필수값이 유효하면 예외를 던지지 않는다', () => {
      expect(() =>
        validateCreateProductInput({
          name: '상품',
          categoryName: 'top',
          price: 1000,
          stocks: [{ sizeId: 1, quantity: 2 }],
          sizeSpecs: [
            {
              sizeLabel: 'M',
              totalLengthCm: 70,
              shoulderCm: 45,
            },
          ],
        } as any),
      ).not.toThrow();
    });

    test('치수값이 범위를 벗어나면 BadRequestError를 던진다', () => {
      expect(() =>
        validateCreateProductInput({
          name: '상품',
          categoryName: 'top',
          price: 1000,
          stocks: [{ sizeId: 1, quantity: 2 }],
          sizeSpecs: [
            {
              sizeLabel: 'M',
              totalLengthCm: 999,
            },
          ],
        } as any),
      ).toThrow(BadRequestError);
    });

    test('할인율이 100 초과면 BadRequestError를 던진다', () => {
      expect(() =>
        validateCreateProductInput({
          name: '상품',
          categoryName: 'top',
          price: 1000,
          discountRate: 101,
          stocks: [{ sizeId: 1, quantity: 2 }],
        } as any),
      ).toThrow(BadRequestError);
    });

    test('할인 시작일만 있고 종료일이 없으면 BadRequestError를 던진다', () => {
      expect(() =>
        validateCreateProductInput({
          name: '상품',
          categoryName: 'top',
          price: 1000,
          discountStartTime: '2026-03-17T00:00:00.000Z',
          stocks: [{ sizeId: 1, quantity: 2 }],
        } as any),
      ).toThrow(BadRequestError);
    });

    test('TOP 계열 카테고리에서 sizeSpecs가 없으면 BadRequestError를 던진다', () => {
      expect(() =>
        validateCreateProductInput({
          name: '상품',
          categoryName: 'top',
          price: 1000,
          stocks: [{ sizeId: 1, quantity: 2 }],
        } as any),
      ).toThrow(BadRequestError);
    });

    test('SHOES 카테고리는 sizeSpecs가 없어도 허용한다', () => {
      expect(() =>
        validateCreateProductInput({
          name: '신발',
          categoryName: 'shoes',
          price: 1000,
          stocks: [{ sizeId: 1, quantity: 2 }],
        } as any),
      ).not.toThrow();
    });

    test('sizeSpecs sizeLabel이 중복되면 BadRequestError를 던진다', () => {
      expect(() =>
        validateCreateProductInput({
          name: '상품',
          categoryName: 'top',
          price: 1000,
          stocks: [{ sizeId: 1, quantity: 2 }],
          sizeSpecs: [
            { sizeLabel: 'M', totalLengthCm: 70 },
            { sizeLabel: 'm', totalLengthCm: 71 },
          ],
        } as any),
      ).toThrow(BadRequestError);
    });
  });

  describe('validateUpdateProductInput', () => {
    test('stocks가 비어 있으면 BadRequestError를 던진다', () => {
      expect(() =>
        validateUpdateProductInput(
          { stocks: [] } as any,
          createProduct(),
        ),
      ).toThrow(BadRequestError);
    });

    test('잘못된 날짜 문자열이 오면 BadRequestError를 던진다', () => {
      expect(() =>
        validateUpdateProductInput(
          {
            stocks: [{ sizeId: 1, quantity: 1 }],
            discountStartTime: 'not-a-date',
          } as any,
          createProduct(),
        ),
      ).toThrow(BadRequestError);
    });
  });

  describe('normalizeProductStocksInput', () => {
    test('sizeId가 DB에 있으면 해당 sizeId를 그대로 사용한다', () => {
      const normalized = normalizeProductStocksInput(
        [{ sizeId: 21, quantity: 3, sizeName: 'XS' }] as any,
        [{ id: 21, name: 'XS' }],
      );

      expect(normalized).toEqual([{ sizeId: 21, quantity: 3 }]);
    });

    test('sizeId가 달라도 sizeName 매핑이 가능하면 DB sizeId로 보정한다', () => {
      const normalized = normalizeProductStocksInput(
        [{ sizeId: 1, quantity: 4, sizeName: '270' }] as any,
        [{ id: 33, name: '270' }],
      );

      expect(normalized).toEqual([{ sizeId: 33, quantity: 4 }]);
    });

    test('sizeId/sizeName 모두 매핑 실패하면 BadRequestError를 던진다', () => {
      expect(() =>
        normalizeProductStocksInput(
          [{ sizeId: 999, quantity: 2, sizeName: 'UNKNOWN' }] as any,
          [{ id: 21, name: 'XS' }],
        ),
      ).toThrow(BadRequestError);
    });
  });

  describe('toProductStockLookupKeys', () => {
    test('stocks에서 중복 없는 sizeIds/sizeNames를 추출한다', () => {
      const keys = toProductStockLookupKeys([
        { sizeId: 21, sizeName: 'xs', quantity: 1 },
        { sizeId: 21, sizeName: 'XS', quantity: 2 },
        { sizeId: 33, sizeName: '270', quantity: 1 },
      ] as any);

      expect(keys.sizeIds).toEqual([21, 33]);
      expect(keys.sizeNames).toEqual(['XS', '270']);
    });
  });

  test('requireProduct는 null이면 NotFoundError를 던진다', () => {
    expect(() => requireProduct(null)).toThrow(NotFoundError);
  });

  test('ensureProductOwner는 판매자가 다르면 ForbiddenError를 던진다', () => {
    expect(() =>
      ensureProductOwner('seller-2', createProduct()),
    ).toThrow(ForbiddenError);
  });

  test('normalizeProductListQuery는 기본값을 채운다', () => {
    const normalized = normalizeProductListQuery({});
    expect(normalized.page).toBe(1);
    expect(normalized.pageSize).toBe(16);
    expect(normalized.sort).toBe('recent');
    expect(normalized.search).toBe('');
  });

  test('normalizeProductInquiryListQuery는 기본값을 채운다', () => {
    const normalized = normalizeProductInquiryListQuery({});
    expect(normalized.page).toBe(1);
    expect(normalized.pageSize).toBe(10);
    expect(normalized.sort).toBe('recent');
    expect(normalized.status).toBe('');
  });

  test('sortProducts는 highRating 기준으로 정렬한다', () => {
    const low = createProduct({
      id: 'low',
      reviews: [{ rating: 1 }, { rating: 2 }],
    });
    const high = createProduct({
      id: 'high',
      reviews: [{ rating: 5 }, { rating: 4 }],
    });

    const sorted = sortProducts([low, high], 'highRating');
    expect(sorted[0].id).toBe('high');
    expect(sorted[1].id).toBe('low');
  });

  test('paginateProducts는 페이지 조건에 맞게 슬라이스한다', () => {
    const list = [1, 2, 3, 4, 5].map((n) => createProduct({ id: `p${n}` }));
    const paged = paginateProducts(list, { page: 2, pageSize: 2 } as any);
    expect(paged.map((item) => item.id)).toEqual(['p3', 'p4']);
  });

  test('filterProductInquiries는 status가 일치하는 항목만 남긴다', () => {
    const inquiries = [
      { id: '1', status: 'WaitingAnswer' },
      { id: '2', status: 'CompletedAnswer' },
    ] as any[];

    const filtered = filterProductInquiries(inquiries, 'CompletedAnswer');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  test('sortProductInquiries는 oldest면 오래된 순으로 정렬한다', () => {
    const inquiries = [
      { id: 'new', createdAt: new Date('2026-03-20T00:00:00.000Z') },
      { id: 'old', createdAt: new Date('2026-03-10T00:00:00.000Z') },
    ] as any[];

    const sorted = sortProductInquiries(inquiries, 'oldest');
    expect(sorted[0].id).toBe('old');
  });

  test('paginateProductInquiries는 페이지 조건에 맞게 슬라이스한다', () => {
    const inquiries = [{ id: '1' }, { id: '2' }, { id: '3' }] as any[];
    const paged = paginateProductInquiries(inquiries, {
      page: 2,
      pageSize: 2,
    });
    expect(paged).toEqual([{ id: '3' }]);
  });

  test('resolveProductImage는 resolveS3ImageUrl 결과로 imageUrl을 갱신한다', async () => {
    (resolveS3ImageUrl as jest.Mock).mockResolvedValue(
      'https://cdn.example.com/product.png',
    );
    const product = createProduct({
      imageUrl: null,
      imageKey: 'product.png',
    });

    const result = await resolveProductImage(product);

    expect(resolveS3ImageUrl).toHaveBeenCalledWith(
      null,
      'product.png',
      '/images/Mask-group.svg',
    );
    expect(result.imageUrl).toBe('https://cdn.example.com/product.png');
  });

  describe('products.payload.util', () => {
    test('toCreateProductPayload는 업로드 이미지와 할인일자를 payload로 변환한다', () => {
      const payload = toCreateProductPayload({
        storeId: 'store-1',
        categoryId: 'cat-1',
        data: {
          name: '상품',
          categoryName: 'top',
          price: 1000,
          stocks: [{ sizeId: 1, quantity: 2 }],
          sizeSpecs: [{ sizeLabel: 'M', totalLengthCm: 70 }],
          discountStartTime: '2026-03-20T00:00:00.000Z',
          discountEndTime: '2026-03-30T00:00:00.000Z',
        } as any,
        uploadedImage: {
          url: 'https://cdn.example.com/p.png',
          key: 'products/p.png',
        },
      });

      expect(payload.storeId).toBe('store-1');
      expect(payload.categoryId).toBe('cat-1');
      expect(payload.imageUrl).toBe('https://cdn.example.com/p.png');
      expect(payload.imageKey).toBe('products/p.png');
      expect(payload.discountStartTime).toBeInstanceOf(Date);
      expect(payload.discountEndTime).toBeInstanceOf(Date);
    });

    test('toUpdateProductPayload는 빈 할인일자를 null로 변환한다', () => {
      const payload = toUpdateProductPayload({
        categoryId: 'cat-2',
        data: {
          name: '수정 상품',
          stocks: [{ sizeId: 1, quantity: 3 }],
          discountStartTime: '',
          discountEndTime: '',
        } as any,
      });

      expect(payload.categoryId).toBe('cat-2');
      expect(payload.discountStartTime).toBeNull();
      expect(payload.discountEndTime).toBeNull();
    });
  });
});
