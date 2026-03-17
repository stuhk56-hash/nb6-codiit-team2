import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';
import {
  ensureSellerStoreMissing,
  ensureStoreOwner,
  ensureStoreUpdateInput,
  normalizeMyStoreProductsQuery,
  requireMyStore,
  requireStore,
  resolveMyStoreProductImages,
  resolveStoreImage,
} from '../utils/stores.service.util';

jest.mock('../../s3/utils/s3.service.util', () => ({
  resolveS3ImageUrl: jest.fn(),
}));

describe('스토어 서비스 유틸 유닛 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('normalizeMyStoreProductsQuery는 기본값을 채운다', () => {
    const normalized = normalizeMyStoreProductsQuery({});
    expect(normalized.page).toBe(1);
    expect(normalized.pageSize).toBe(10);
  });

  test('normalizeMyStoreProductsQuery는 양수 page/pageSize를 그대로 사용한다', () => {
    const normalized = normalizeMyStoreProductsQuery({ page: 2, pageSize: 5 });
    expect(normalized.page).toBe(2);
    expect(normalized.pageSize).toBe(5);
  });

  test('requireStore는 null이면 NotFoundError를 던진다', () => {
    expect(() => requireStore(null as any)).toThrow(NotFoundError);
  });

  test('requireMyStore는 null이면 NotFoundError를 던진다', () => {
    expect(() => requireMyStore(null as any)).toThrow(NotFoundError);
  });

  test('ensureSellerStoreMissing은 기존 스토어가 있으면 ConflictError를 던진다', () => {
    expect(() => ensureSellerStoreMissing({ id: 'store-1' } as any)).toThrow(
      ConflictError,
    );
  });

  test('ensureStoreOwner는 소유자가 다르면 ForbiddenError를 던진다', () => {
    expect(() => ensureStoreOwner('seller-1', { userId: 'seller-2' })).toThrow(
      ForbiddenError,
    );
  });

  test('ensureStoreUpdateInput은 body와 이미지가 모두 없으면 BadRequestError를 던진다', () => {
    expect(() => ensureStoreUpdateInput({})).toThrow(BadRequestError);
  });

  test('resolveStoreImage는 resolveS3ImageUrl 결과로 imageUrl을 갱신한다', async () => {
    (resolveS3ImageUrl as jest.Mock).mockResolvedValue(
      'https://cdn.example.com/store.png',
    );
    const store = { imageUrl: null, imageKey: 'store.png' } as any;

    const result = await resolveStoreImage(store);

    expect(resolveS3ImageUrl).toHaveBeenCalledWith(
      null,
      'store.png',
      '/images/Mask-group.svg',
    );
    expect(result.imageUrl).toBe('https://cdn.example.com/store.png');
  });

  test('resolveMyStoreProductImages는 각 상품 imageUrl을 갱신한다', async () => {
    (resolveS3ImageUrl as jest.Mock)
      .mockResolvedValueOnce('https://cdn.example.com/p1.png')
      .mockResolvedValueOnce('https://cdn.example.com/p2.png');

    const products = [
      { imageUrl: null, imageKey: 'p1.png' },
      { imageUrl: null, imageKey: 'p2.png' },
    ] as any[];

    const result = await resolveMyStoreProductImages(products);

    expect(resolveS3ImageUrl).toHaveBeenCalledTimes(2);
    expect(result[0].imageUrl).toBe('https://cdn.example.com/p1.png');
    expect(result[1].imageUrl).toBe('https://cdn.example.com/p2.png');
  });
});
