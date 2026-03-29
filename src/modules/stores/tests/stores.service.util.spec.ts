import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';
import {
  toCreateStoreRecordInput,
  toUpdateStoreRecordInput,
} from '../utils/stores.payload.util';
import { toStoreAuditSnapshot } from '../utils/stores.audit.util';
import { encryptStoreBusinessInfoInput } from '../utils/stores.crypto.util';
import { toDecryptedStoreBusinessInfo } from '../utils/stores.business-info.util';
import {
  ensureStoreBusinessInfoValidity,
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

jest.mock('../../../lib/security/store-pii-crypto', () => ({
  encryptStorePiiNullable: jest.fn((value: string | null | undefined) =>
    value ? `enc:${value}` : value ?? null,
  ),
  decryptStorePiiNullable: jest.fn((value: string | null) =>
    value && value.startsWith('enc:') ? value.slice(4) : value,
  ),
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
    expect(() => ensureStoreUpdateInput({})).toThrow(
      '수정할 항목이 없습니다.',
    );
  });

  test('사업자등록번호가 유효하지 않으면 BadRequestError를 던진다', () => {
    expect(() =>
      ensureStoreBusinessInfoValidity({
        businessRegistrationNumber: '111-11-11111',
      }),
    ).toThrow(BadRequestError);
  });

  test('통신판매업 신고번호가 유효하지 않으면 BadRequestError를 던진다', () => {
    expect(() =>
      ensureStoreBusinessInfoValidity({
        mailOrderSalesNumber: '서울강남-1234',
      }),
    ).toThrow(BadRequestError);
  });

  test('사업자 연락처가 유효하지 않으면 BadRequestError를 던진다', () => {
    expect(() =>
      ensureStoreBusinessInfoValidity({
        businessPhoneNumber: 'abc',
      }),
    ).toThrow(BadRequestError);
  });

  test('사업자 정보가 유효하면 예외를 던지지 않는다', () => {
    expect(() =>
      ensureStoreBusinessInfoValidity({
        businessRegistrationNumber: '220-81-62517',
        businessPhoneNumber: '02-3456-7890',
        mailOrderSalesNumber: '2024-서울강남-1234',
      }),
    ).not.toThrow();
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

  describe('stores.payload.util', () => {
    test('toCreateStoreRecordInput은 sellerId/data/image를 저장 payload로 합친다', () => {
      const payload = toCreateStoreRecordInput({
        sellerId: 'seller-1',
        data: {
          name: '스토어',
          address: '서울',
          detailAddress: '101호',
          phoneNumber: '010-1111-1111',
          content: '소개',
        } as any,
        uploadedImage: {
          url: 'https://cdn.example.com/store.png',
          key: 'stores/store.png',
        },
      });

      expect(payload.sellerId).toBe('seller-1');
      expect(payload.imageUrl).toBe('https://cdn.example.com/store.png');
      expect(payload.imageKey).toBe('stores/store.png');
    });

    test('toUpdateStoreRecordInput은 업로드 이미지가 없으면 이미지 필드를 포함하지 않는다', () => {
      const payload = toUpdateStoreRecordInput({
        data: { name: '변경 스토어' } as any,
      });

      expect(payload).toEqual({ name: '변경 스토어' });
      expect(payload).not.toHaveProperty('imageUrl');
      expect(payload).not.toHaveProperty('imageKey');
    });
  });

  describe('stores.crypto/audit/business-info util', () => {
    test('encryptStoreBusinessInfoInput은 사업자 관련 필드를 암호화한다', () => {
      const encrypted = encryptStoreBusinessInfoInput({
        businessRegistrationNumber: '123-45-67890',
        businessPhoneNumber: '02-1234-5678',
        mailOrderSalesNumber: '2024-서울강남-1234',
        representativeName: '홍길동',
        businessAddress: '서울시 강남구',
      });

      expect(encrypted.businessRegistrationNumber).toBe('enc:123-45-67890');
      expect(encrypted.businessPhoneNumber).toBe('enc:02-1234-5678');
      expect(encrypted.mailOrderSalesNumber).toBe('enc:2024-서울강남-1234');
      expect(encrypted.representativeName).toBe('enc:홍길동');
      expect(encrypted.businessAddress).toBe('enc:서울시 강남구');
    });

    test('toDecryptedStoreBusinessInfo는 암호화된 필드를 복호화한다', () => {
      const decrypted = toDecryptedStoreBusinessInfo({
        businessRegistrationNumber: 'enc:123-45-67890',
        businessPhoneNumber: 'enc:02-1234-5678',
        mailOrderSalesNumber: 'enc:2024-서울강남-1234',
        representativeName: 'enc:홍길동',
        businessAddress: 'enc:서울시 강남구',
      } as any);

      expect(decrypted.businessRegistrationNumber).toBe('123-45-67890');
      expect(decrypted.businessPhoneNumber).toBe('02-1234-5678');
      expect(decrypted.mailOrderSalesNumber).toBe('2024-서울강남-1234');
      expect(decrypted.representativeName).toBe('홍길동');
      expect(decrypted.businessAddress).toBe('서울시 강남구');
    });

    test('toStoreAuditSnapshot은 민감정보를 마스킹해서 반환한다', () => {
      const snapshot = toStoreAuditSnapshot({
        id: 'store-1',
        sellerId: 'seller-1',
        name: '스토어',
        address: '서울',
        detailAddress: '101호',
        phoneNumber: '010-1111-1111',
        content: '소개',
        businessRegistrationNumber: 'enc:123-45-67890',
        businessPhoneNumber: 'enc:02-1234-5678',
        mailOrderSalesNumber: 'enc:2024-서울강남-1234',
        representativeName: 'enc:홍길동',
        businessAddress: 'enc:서울시 강남구',
      });

      expect(snapshot.businessRegistrationNumber).toBe('***-**-7890');
      expect(snapshot.businessPhoneNumber).toBe('***-****-5678');
      expect(snapshot.mailOrderSalesNumber).toBe('2024-서울강남-**34');
      expect(snapshot.representativeName).toBe('홍**');
      expect(snapshot.businessAddress).toBe('[MASKED_ADDRESS]');
    });
  });
});
