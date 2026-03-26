import { s3Service } from '../../s3/s3.service';
import { storesRepository } from '../stores.repository';
import { StoresService } from '../stores.service';
import {
  ensureStoreBusinessInfoValidity,
  ensureSellerStoreMissing,
  ensureStoreOwner,
  ensureStoreUpdateInput,
  normalizeMyStoreProductsQuery,
  resolveMyStoreProductImages,
  resolveStoreImage,
  requireMyStore,
  requireStore,
} from '../utils/stores.service.util';
import { toStoreAuditSnapshot } from '../utils/stores.audit.util';
import { encryptStoreBusinessInfoInput } from '../utils/stores.crypto.util';
import {
  toCreateStoreRecordInput,
  toUpdateStoreRecordInput,
} from '../utils/stores.payload.util';
import {
  toFavoriteStoreDeleteResponseDto,
  toFavoriteStoreRegisterResponseDto,
  toMyStoreProductResponseDto,
  toMyStoreResponseDto,
  toStoreDetailResponseDto,
  toStoreResponseDto,
} from '../utils/stores.mapper';

jest.mock('../../s3/s3.service', () => ({
  s3Service: {
    uploadFile: jest.fn(),
  },
}));

jest.mock('../stores.repository', () => ({
  storesRepository: {
    findBySellerId: jest.fn(),
    findMyStoreBySellerId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    createAuditLog: jest.fn(),
    findMyProductsBySellerId: jest.fn(),
    registerFavorite: jest.fn(),
    deleteFavorite: jest.fn(),
  },
}));

jest.mock('../utils/stores.service.util', () => ({
  ensureStoreBusinessInfoValidity: jest.fn(),
  ensureSellerStoreMissing: jest.fn(),
  ensureStoreOwner: jest.fn(),
  ensureStoreUpdateInput: jest.fn(),
  normalizeMyStoreProductsQuery: jest.fn(),
  resolveMyStoreProductImages: jest.fn(async (products: unknown[]) => products),
  resolveStoreImage: jest.fn(async (store: unknown) => store),
  requireMyStore: jest.fn((store: unknown) => store),
  requireStore: jest.fn((store: unknown) => store),
}));

jest.mock('../utils/stores.audit.util', () => ({
  toStoreAuditSnapshot: jest.fn((store: unknown) => store),
}));

jest.mock('../utils/stores.crypto.util', () => ({
  encryptStoreBusinessInfoInput: jest.fn((data: unknown) => data),
}));

jest.mock('../utils/stores.payload.util', () => ({
  toCreateStoreRecordInput: jest.fn((params: any) => ({
    sellerId: params.sellerId,
    ...params.data,
    ...(params.uploadedImage
      ? {
          imageUrl: params.uploadedImage.url,
          imageKey: params.uploadedImage.key,
        }
      : {}),
  })),
  toUpdateStoreRecordInput: jest.fn((params: any) => ({
    ...params.data,
    ...(params.uploadedImage
      ? {
          imageUrl: params.uploadedImage.url,
          imageKey: params.uploadedImage.key,
        }
      : {}),
  })),
}));

jest.mock('../utils/stores.mapper', () => ({
  toStoreResponseDto: jest.fn((store: any) => ({ id: store.id, name: store.name })),
  toStoreDetailResponseDto: jest.fn((store: any) => ({ id: store.id, name: store.name })),
  toMyStoreResponseDto: jest.fn((store: any) => ({ id: store.id, name: store.name })),
  toMyStoreProductResponseDto: jest.fn((products: any[], totalCount: number) => ({
    list: products,
    totalCount,
  })),
  toFavoriteStoreRegisterResponseDto: jest.fn((store: any) => ({
    type: 'register',
    store: { id: store.id },
  })),
  toFavoriteStoreDeleteResponseDto: jest.fn((store: any) => ({
    type: 'delete',
    store: { id: store.id },
  })),
}));

describe('스토어 서비스 유닛 테스트', () => {
  const service = new StoresService();
  const mockedStoresRepository = storesRepository as jest.Mocked<
    typeof storesRepository
  >;
  const mockedS3Service = s3Service as jest.Mocked<typeof s3Service>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('스토어 생성 시 기존 스토어 유무를 확인하고 업로드한 이미지 URL/키를 함께 저장한다', async () => {
    const createdStore = { id: 'store-1', name: '신규 스토어' } as any;
    const imageFile = { originalname: 'store.png' } as Express.Multer.File;

    mockedStoresRepository.findBySellerId.mockResolvedValue(null);
    mockedS3Service.uploadFile.mockResolvedValue({
      url: 'https://cdn.example.com/store.png',
      key: 'store.png',
    } as any);
    mockedStoresRepository.create.mockResolvedValue(createdStore);

    const result = await service.create(
      'seller-1',
      {
        name: '신규 스토어',
        address: '서울시 강남구',
        detailAddress: '101호',
        phoneNumber: '010-1111-1111',
        content: '소개',
      },
      imageFile,
    );

    expect(ensureSellerStoreMissing).toHaveBeenCalledWith(null);
    expect(ensureStoreBusinessInfoValidity).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '신규 스토어',
      }),
    );
    expect(mockedS3Service.uploadFile).toHaveBeenCalledWith(imageFile);
    expect(encryptStoreBusinessInfoInput).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '신규 스토어',
      }),
    );
    expect(toCreateStoreRecordInput).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerId: 'seller-1',
      }),
    );
    expect(mockedStoresRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerId: 'seller-1',
        imageUrl: 'https://cdn.example.com/store.png',
        imageKey: 'store.png',
      }),
    );
    expect(toStoreAuditSnapshot).toHaveBeenCalledWith(createdStore);
    expect(mockedStoresRepository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: 'store-1',
        sellerId: 'seller-1',
        action: 'CREATED',
      }),
    );
    expect(resolveStoreImage).toHaveBeenCalledWith(createdStore);
    expect(toStoreResponseDto).toHaveBeenCalledWith(createdStore);
    expect(result).toEqual({ id: 'store-1', name: '신규 스토어' });
  });

  test('스토어 수정 시 입력값 검증과 소유자 검증을 통과하면 수정 결과를 반환한다', async () => {
    const existingStore = { id: 'store-1', sellerId: 'seller-1' } as any;
    const updatedStore = { id: 'store-1', name: '수정 스토어' } as any;
    mockedStoresRepository.findById.mockResolvedValue(existingStore);
    mockedStoresRepository.update.mockResolvedValue(updatedStore);

    const result = await service.update(
      'seller-1',
      'store-1',
      { name: '수정 스토어' },
      undefined,
    );

    expect(ensureStoreUpdateInput).toHaveBeenCalledWith({ name: '수정 스토어' }, undefined);
    expect(ensureStoreBusinessInfoValidity).toHaveBeenCalledWith({
      name: '수정 스토어',
    });
    expect(requireStore).toHaveBeenCalledWith(existingStore);
    expect(ensureStoreOwner).toHaveBeenCalledWith('seller-1', { userId: 'seller-1' });
    expect(encryptStoreBusinessInfoInput).toHaveBeenCalledWith({
      name: '수정 스토어',
    });
    expect(toUpdateStoreRecordInput).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: '수정 스토어' },
      }),
    );
    expect(mockedStoresRepository.update).toHaveBeenCalledWith(
      'store-1',
      expect.objectContaining({ name: '수정 스토어' }),
    );
    expect(toStoreAuditSnapshot).toHaveBeenCalledWith(existingStore);
    expect(toStoreAuditSnapshot).toHaveBeenCalledWith(updatedStore);
    expect(mockedStoresRepository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: 'store-1',
        sellerId: 'seller-1',
        action: 'UPDATED',
      }),
    );
    expect(resolveStoreImage).toHaveBeenCalledWith(updatedStore);
    expect(toStoreResponseDto).toHaveBeenCalledWith(updatedStore);
    expect(result).toEqual({ id: 'store-1', name: '수정 스토어' });
  });

  test('스토어 상세 조회 시 DB 조회 결과를 검증하고 상세 DTO를 반환한다', async () => {
    const store = { id: 'store-1', name: '스토어' } as any;
    mockedStoresRepository.findById.mockResolvedValue(store);

    const result = await service.findStore('store-1');

    expect(mockedStoresRepository.findById).toHaveBeenCalledWith('store-1');
    expect(requireStore).toHaveBeenCalledWith(store);
    expect(resolveStoreImage).toHaveBeenCalledWith(store);
    expect(toStoreDetailResponseDto).toHaveBeenCalledWith(store);
    expect(result).toEqual({ id: 'store-1', name: '스토어' });
  });

  test('내 스토어 상품 목록 조회 시 page/pageSize를 기본값으로 보정해 목록을 조회한다', async () => {
    const normalizedQuery = { page: 1, pageSize: 5 };
    const foundStore = { id: 'store-1' } as any;
    const productRows = [{ id: 'product-1' }] as any[];

    mockedStoresRepository.findMyStoreBySellerId.mockResolvedValue(foundStore);
    (normalizeMyStoreProductsQuery as jest.Mock).mockReturnValue(normalizedQuery);
    mockedStoresRepository.findMyProductsBySellerId.mockResolvedValue({
      products: productRows as any,
      totalCount: 1,
    });
    (resolveMyStoreProductImages as jest.Mock).mockResolvedValue(productRows);

    const result = await service.myStoreProduct('seller-1', {
      page: 1,
      pageSize: 5,
    });

    expect(requireMyStore).toHaveBeenCalledWith(foundStore);
    expect(normalizeMyStoreProductsQuery).toHaveBeenCalledWith({
      page: 1,
      pageSize: 5,
    });
    expect(mockedStoresRepository.findMyProductsBySellerId).toHaveBeenCalledWith(
      'seller-1',
      normalizedQuery,
    );
    expect(resolveMyStoreProductImages).toHaveBeenCalledWith(productRows);
    expect(toMyStoreProductResponseDto).toHaveBeenCalledWith(productRows, 1);
    expect(result).toEqual({ list: productRows, totalCount: 1 });
  });

  test('스토어 즐겨찾기 등록 시 스토어를 검증하고 등록 응답을 반환한다', async () => {
    const store = { id: 'store-1' } as any;
    mockedStoresRepository.findById.mockResolvedValue(store);
    mockedStoresRepository.registerFavorite.mockResolvedValue(store);

    const result = await service.favoriteStoreRegister('buyer-1', 'store-1');

    expect(mockedStoresRepository.findById).toHaveBeenCalledWith('store-1');
    expect(mockedStoresRepository.registerFavorite).toHaveBeenCalledWith(
      'buyer-1',
      'store-1',
    );
    expect(requireStore).toHaveBeenCalledTimes(2);
    expect(resolveStoreImage).toHaveBeenCalledWith(store);
    expect(toFavoriteStoreRegisterResponseDto).toHaveBeenCalledWith(store);
    expect(result).toEqual({
      type: 'register',
      store: { id: 'store-1' },
    });
  });

  test('스토어 즐겨찾기 해제 시 스토어를 검증하고 해제 응답을 반환한다', async () => {
    const store = { id: 'store-1' } as any;
    mockedStoresRepository.findById.mockResolvedValue(store);
    mockedStoresRepository.deleteFavorite.mockResolvedValue(store);

    const result = await service.favoriteStoreDelete('buyer-1', 'store-1');

    expect(mockedStoresRepository.findById).toHaveBeenCalledWith('store-1');
    expect(mockedStoresRepository.deleteFavorite).toHaveBeenCalledWith(
      'buyer-1',
      'store-1',
    );
    expect(requireStore).toHaveBeenCalledTimes(2);
    expect(resolveStoreImage).toHaveBeenCalledWith(store);
    expect(toFavoriteStoreDeleteResponseDto).toHaveBeenCalledWith(store);
    expect(result).toEqual({
      type: 'delete',
      store: { id: 'store-1' },
    });
  });

  test('내 스토어 조회 시 저장소 결과를 검증해 내 스토어 DTO를 반환한다', async () => {
    const myStore = { id: 'store-1', name: '내 스토어' } as any;
    mockedStoresRepository.findMyStoreBySellerId.mockResolvedValue(myStore);

    const result = await service.myStore('seller-1');

    expect(mockedStoresRepository.findMyStoreBySellerId).toHaveBeenCalledWith(
      'seller-1',
    );
    expect(requireMyStore).toHaveBeenCalledWith(myStore);
    expect(resolveStoreImage).toHaveBeenCalledWith(myStore);
    expect(toMyStoreResponseDto).toHaveBeenCalledWith(myStore);
    expect(result).toEqual({ id: 'store-1', name: '내 스토어' });
  });
});
