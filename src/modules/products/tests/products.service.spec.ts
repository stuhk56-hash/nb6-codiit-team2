import { requireBuyer, requireSeller } from '../../../lib/request/auth-user';
import { notificationsRepository } from '../../notifications/notifications.repository';
import { s3Service } from '../../s3/s3.service';
import { productsRepository } from '../products.repository';
import { ProductsService } from '../products.service';
import {
  ensureCategory,
  ensureProductOwner,
  ensureSellerStore,
  normalizeProductInquiryListQuery,
  normalizeProductListQuery,
  paginateProductInquiries,
  paginateProducts,
  requireProduct,
  requireProducts,
  resolveProductImage,
  resolveProductsImage,
  sortProductInquiries,
  sortProducts,
  validateCreateProductInput,
  validateUpdateProductInput,
  filterProductInquiries,
} from '../utils/products.service.util';
import {
  toCreateProductPayload,
  toUpdateProductPayload,
} from '../utils/products.payload.util';
import {
  toDetailProductResponseDto,
  toProductInquiryListResponseDto,
  toProductInquiryResponseDto,
  toProductListResponseDto,
} from '../utils/products.mapper';

jest.mock('../../../lib/request/auth-user', () => ({
  requireSeller: jest.fn(),
  requireBuyer: jest.fn(),
}));

jest.mock('../../s3/s3.service', () => ({
  s3Service: {
    uploadFile: jest.fn(),
  },
}));

jest.mock('../../notifications/notifications.repository', () => ({
  notificationsRepository: {
    create: jest.fn(),
    createMany: jest.fn(),
  },
}));

jest.mock('../products.repository', () => ({
  productsRepository: {
    findSellerStore: jest.fn(),
    findCategoryByName: jest.fn(),
    findById: jest.fn(),
    findPageByQuery: jest.fn(),
    findFilteredByQuery: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    createInquiry: jest.fn(),
    findProductInquiries: jest.fn(),
  },
}));

jest.mock('../utils/products.service.util', () => ({
  ensureCategory: jest.fn(),
  ensureProductOwner: jest.fn(),
  requireProducts: jest.fn(),
  ensureSellerStore: jest.fn(),
  filterProductInquiries: jest.fn((inquiries: unknown[]) => inquiries),
  normalizeProductListQuery: jest.fn(),
  normalizeProductInquiryListQuery: jest.fn(),
  paginateProductInquiries: jest.fn((inquiries: unknown[]) => inquiries),
  paginateProducts: jest.fn((products: unknown[]) => products),
  requireProduct: jest.fn((product: unknown) => product),
  sortProductInquiries: jest.fn((inquiries: unknown[]) => inquiries),
  sortProducts: jest.fn((products: unknown[]) => products),
  resolveProductImage: jest.fn(async (product: unknown) => product),
  resolveProductsImage: jest.fn(async (products: unknown[]) => products),
  validateCreateProductInput: jest.fn(),
  validateUpdateProductInput: jest.fn(),
}));

jest.mock('../utils/products.payload.util', () => ({
  toCreateProductPayload: jest.fn((params: any) => ({
    storeId: params.storeId,
    categoryId: params.categoryId,
    ...params.data,
    ...(params.uploadedImage
      ? {
          imageUrl: params.uploadedImage.url,
          imageKey: params.uploadedImage.key,
        }
      : {}),
    discountStartTime: params.data.discountStartTime
      ? new Date(params.data.discountStartTime)
      : undefined,
    discountEndTime: params.data.discountEndTime
      ? new Date(params.data.discountEndTime)
      : undefined,
  })),
  toUpdateProductPayload: jest.fn((params: any) => ({
    categoryId: params.categoryId,
    ...params.data,
    ...(params.uploadedImage
      ? {
          imageUrl: params.uploadedImage.url,
          imageKey: params.uploadedImage.key,
        }
      : {}),
    discountStartTime:
      params.data.discountStartTime !== undefined
        ? params.data.discountStartTime
          ? new Date(params.data.discountStartTime)
          : null
        : undefined,
    discountEndTime:
      params.data.discountEndTime !== undefined
        ? params.data.discountEndTime
          ? new Date(params.data.discountEndTime)
          : null
        : undefined,
  })),
}));

jest.mock('../utils/products.mapper', () => ({
  toDetailProductResponseDto: jest.fn((product: any) => ({
    id: product.id,
    name: product.name ?? '상품',
  })),
  toProductListResponseDto: jest.fn((list: any[]) => ({
    list,
    totalCount: list.length,
  })),
  toProductInquiryResponseDto: jest.fn((inquiry: any) => ({
    id: inquiry.id,
    title: inquiry.title,
  })),
  toProductInquiryListResponseDto: jest.fn((list: any[]) => ({
    list,
    totalCount: list.length,
  })),
}));

describe('상품 서비스 유닛 테스트', () => {
  const service = new ProductsService();
  const mockedRepository = productsRepository as jest.Mocked<
    typeof productsRepository
  >;
  const mockedS3Service = s3Service as jest.Mocked<typeof s3Service>;
  const mockedNotificationsRepository =
    notificationsRepository as jest.Mocked<typeof notificationsRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('상품 생성 시 판매자/스토어/카테고리를 검증하고 업로드 이미지를 포함해 저장한다', async () => {
    const sellerUser = { id: 'seller-1', type: 'SELLER' } as any;
    const createInput = {
      categoryName: 'TOP',
      name: '신규 상품',
      price: 12000,
      content: '설명',
      discountRate: 10,
      discountStartTime: '2026-03-17T00:00:00.000Z',
      discountEndTime: '2026-03-31T00:00:00.000Z',
      stocks: [{ sizeId: 1, quantity: 5 }],
    };
    const imageFile = { originalname: 'a.png' } as Express.Multer.File;
    const createdProduct = { id: 'product-1', name: '신규 상품' } as any;

    mockedRepository.findSellerStore.mockResolvedValue({ id: 'store-1' } as any);
    mockedRepository.findCategoryByName.mockResolvedValue({ id: 'cat-1' } as any);
    mockedS3Service.uploadFile.mockResolvedValue({
      url: 'https://cdn.example.com/product-1.png',
      key: 'product-1.png',
    } as any);
    mockedRepository.create.mockResolvedValue(createdProduct);

    const result = await service.create(sellerUser, createInput as any, imageFile);

    expect(requireSeller).toHaveBeenCalledWith(sellerUser);
    expect(validateCreateProductInput).toHaveBeenCalledWith(createInput);
    expect(ensureSellerStore).toHaveBeenCalledWith('store-1');
    expect(ensureCategory).toHaveBeenCalledWith('cat-1');
    expect(mockedS3Service.uploadFile).toHaveBeenCalledWith(imageFile);
    expect(toCreateProductPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: 'store-1',
        categoryId: 'cat-1',
        data: createInput,
      }),
    );
    expect(mockedRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: 'store-1',
        categoryId: 'cat-1',
        imageUrl: 'https://cdn.example.com/product-1.png',
        imageKey: 'product-1.png',
        discountStartTime: expect.any(Date),
        discountEndTime: expect.any(Date),
      }),
    );
    expect(resolveProductImage).toHaveBeenCalledWith(createdProduct);
    expect(toDetailProductResponseDto).toHaveBeenCalledWith(createdProduct);
    expect(result).toEqual({ id: 'product-1', name: '신규 상품' });
  });

  test('상품 목록 조회에서 highRating 정렬은 메모리 정렬 후 페이징을 적용한다', async () => {
    const normalizedQuery = {
      page: 1,
      pageSize: 16,
      search: '',
      sort: 'highRating',
      priceMin: 0,
      priceMax: Number.MAX_SAFE_INTEGER,
      size: '',
      favoriteStore: '',
      categoryName: '',
    };
    const filteredProducts = [{ id: 'p1' }, { id: 'p2' }] as any[];
    const pagedProducts = [{ id: 'p2' }] as any[];

    (normalizeProductListQuery as jest.Mock).mockReturnValue(normalizedQuery);
    mockedRepository.findFilteredByQuery.mockResolvedValue(filteredProducts as any);
    (sortProducts as jest.Mock).mockReturnValue(filteredProducts);
    (paginateProducts as jest.Mock).mockReturnValue(pagedProducts);
    (resolveProductsImage as jest.Mock).mockResolvedValue(pagedProducts);
    (toProductListResponseDto as jest.Mock).mockReturnValue({
      list: [{ id: 'p2' }],
      totalCount: 1,
    });

    const result = await service.findList({ sort: 'highRating' });

    expect(mockedRepository.findFilteredByQuery).toHaveBeenCalledWith(normalizedQuery);
    expect(mockedRepository.findPageByQuery).not.toHaveBeenCalled();
    expect(requireProducts).toHaveBeenCalledWith(filteredProducts);
    expect(sortProducts).toHaveBeenCalledWith(filteredProducts, 'highRating');
    expect(paginateProducts).toHaveBeenCalledWith(filteredProducts, normalizedQuery);
    expect(result).toEqual({
      list: [{ id: 'p2' }],
      totalCount: 2,
    });
  });

  test('상품 목록 조회에서 기본 정렬은 DB 페이징 조회를 사용한다', async () => {
    const normalizedQuery = {
      page: 2,
      pageSize: 10,
      search: '',
      sort: 'recent',
      priceMin: 0,
      priceMax: Number.MAX_SAFE_INTEGER,
      size: '',
      favoriteStore: '',
      categoryName: '',
    };
    const pageQueryResult = {
      products: [{ id: 'p10' }],
      totalCount: 37,
    };

    (normalizeProductListQuery as jest.Mock).mockReturnValue(normalizedQuery);
    mockedRepository.findPageByQuery.mockResolvedValue(pageQueryResult as any);
    (resolveProductsImage as jest.Mock).mockResolvedValue(
      pageQueryResult.products as any,
    );
    (toProductListResponseDto as jest.Mock).mockReturnValue({
      list: [{ id: 'p10' }],
      totalCount: 1,
    });

    const result = await service.findList({ page: 2, pageSize: 10 });

    expect(mockedRepository.findFilteredByQuery).not.toHaveBeenCalled();
    expect(mockedRepository.findPageByQuery).toHaveBeenCalledWith(normalizedQuery);
    expect(requireProducts).toHaveBeenCalledWith(pageQueryResult.products);
    expect(result).toEqual({
      list: [{ id: 'p10' }],
      totalCount: 37,
    });
  });

  test('상품 수정 시 소유자 검증 후 빈 할인일자를 null로 변환해 저장한다', async () => {
    const sellerUser = { id: 'seller-1', type: 'SELLER' } as any;
    const existingProduct = {
      id: 'product-1',
      store: { sellerId: 'seller-1' },
      discountStartTime: new Date('2026-03-01T00:00:00.000Z'),
      discountEndTime: new Date('2026-03-10T00:00:00.000Z'),
    } as any;
    const updateInput = {
      categoryName: 'PANTS',
      name: '수정 상품',
      stocks: [{ sizeId: 1, quantity: 20 }],
      discountStartTime: '',
      discountEndTime: '',
    };
    const updatedProduct = { id: 'product-1', name: '수정 상품' } as any;

    mockedRepository.findById.mockResolvedValue(existingProduct);
    mockedRepository.findCategoryByName.mockResolvedValue({ id: 'cat-2' } as any);
    mockedRepository.update.mockResolvedValue(updatedProduct);

    const result = await service.update(
      sellerUser,
      'product-1',
      updateInput as any,
      undefined,
    );

    expect(requireSeller).toHaveBeenCalledWith(sellerUser);
    expect(requireProduct).toHaveBeenCalledWith(existingProduct);
    expect(ensureProductOwner).toHaveBeenCalledWith('seller-1', existingProduct);
    expect(validateUpdateProductInput).toHaveBeenCalledWith(updateInput, existingProduct);
    expect(ensureCategory).toHaveBeenCalledWith('cat-2');
    expect(toUpdateProductPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'cat-2',
        data: updateInput,
      }),
    );
    expect(mockedRepository.update).toHaveBeenCalledWith(
      'product-1',
      expect.objectContaining({
        categoryId: 'cat-2',
        discountStartTime: null,
        discountEndTime: null,
      }),
    );
    expect(result).toEqual({ id: 'product-1', name: '수정 상품' });
  });

  test('상품 문의 생성 시 구매자 권한을 검증한 뒤 문의를 저장한다', async () => {
    const buyerUser = { id: 'buyer-1', type: 'BUYER' } as any;
    const inquiryInput = {
      title: '배송 문의',
      content: '언제 오나요?',
      isSecret: true,
    };
    const createdInquiry = {
      id: 'inq-1',
      title: '배송 문의',
    } as any;

    mockedRepository.findById.mockResolvedValue({
      id: 'product-1',
      name: '문의 상품',
      store: { sellerId: 'seller-1' },
    } as any);
    mockedRepository.createInquiry.mockResolvedValue(createdInquiry);
    mockedNotificationsRepository.create.mockResolvedValue({ id: 'n1' } as any);

    const result = await service.createInquiry(buyerUser, 'product-1', inquiryInput);

    expect(requireBuyer).toHaveBeenCalledWith(buyerUser);
    expect(mockedRepository.findById).toHaveBeenCalledWith('product-1');
    expect(mockedRepository.createInquiry).toHaveBeenCalledWith({
      productId: 'product-1',
      buyerId: 'buyer-1',
      title: '배송 문의',
      content: '언제 오나요?',
      isSecret: true,
    });
    expect(mockedNotificationsRepository.create).toHaveBeenCalledWith(
      'seller-1',
      '상품 "문의 상품"에 새로운 문의가 등록되었습니다.',
    );
    expect(toProductInquiryResponseDto).toHaveBeenCalledWith(createdInquiry);
    expect(result).toEqual({ id: 'inq-1', title: '배송 문의' });
  });

  test('상품 상세 조회 시 저장소에서 조회한 상품을 상세 DTO로 반환한다', async () => {
    const foundProduct = { id: 'product-1', name: '상세 상품' } as any;
    mockedRepository.findById.mockResolvedValue(foundProduct);

    const result = await service.findProduct('product-1');

    expect(mockedRepository.findById).toHaveBeenCalledWith('product-1');
    expect(requireProduct).toHaveBeenCalledWith(foundProduct);
    expect(resolveProductImage).toHaveBeenCalledWith(foundProduct);
    expect(toDetailProductResponseDto).toHaveBeenCalledWith(foundProduct);
    expect(result).toEqual({ id: 'product-1', name: '상세 상품' });
  });

  test('상품 삭제 시 판매자 권한과 소유자 검증을 통과하면 삭제를 수행한다', async () => {
    const sellerUser = { id: 'seller-1', type: 'SELLER' } as any;
    const existingProduct = {
      id: 'product-1',
      store: { sellerId: 'seller-1' },
    } as any;
    mockedRepository.findById.mockResolvedValue(existingProduct);
    mockedRepository.deleteById.mockResolvedValue(undefined as any);

    await service.remove(sellerUser, 'product-1');

    expect(requireSeller).toHaveBeenCalledWith(sellerUser);
    expect(requireProduct).toHaveBeenCalledWith(existingProduct);
    expect(ensureProductOwner).toHaveBeenCalledWith('seller-1', existingProduct);
    expect(mockedRepository.deleteById).toHaveBeenCalledWith('product-1');
  });

  test('상품 문의 목록 조회 시 정규화-필터-정렬-페이징 순서로 처리한다', async () => {
    const inquiryList = [{ id: 'inq-1' }, { id: 'inq-2' }] as any[];
    const filteredInquiries = [{ id: 'inq-2' }] as any[];
    const pagedInquiries = [{ id: 'inq-2' }] as any[];
    const normalizedQuery = {
      page: 1,
      pageSize: 10,
      sort: 'recent',
      status: 'WaitingAnswer',
    };

    mockedRepository.findById.mockResolvedValue({ id: 'product-1' } as any);
    mockedRepository.findProductInquiries.mockResolvedValue(inquiryList as any);
    (normalizeProductInquiryListQuery as jest.Mock).mockReturnValue(normalizedQuery);
    (filterProductInquiries as jest.Mock).mockReturnValue(filteredInquiries);
    (sortProductInquiries as jest.Mock).mockReturnValue(filteredInquiries);
    (paginateProductInquiries as jest.Mock).mockReturnValue(pagedInquiries);
    (toProductInquiryListResponseDto as jest.Mock).mockReturnValue({
      list: pagedInquiries,
      totalCount: 1,
    });

    const result = await service.getListInquiry('product-1', {
      status: 'WaitingAnswer',
    });

    expect(mockedRepository.findById).toHaveBeenCalledWith('product-1');
    expect(mockedRepository.findProductInquiries).toHaveBeenCalledWith(
      'product-1',
    );
    expect(filterProductInquiries).toHaveBeenCalledWith(
      inquiryList,
      'WaitingAnswer',
    );
    expect(sortProductInquiries).toHaveBeenCalledWith(filteredInquiries, 'recent');
    expect(paginateProductInquiries).toHaveBeenCalledWith(
      filteredInquiries,
      normalizedQuery,
    );
    expect(result).toEqual({
      list: pagedInquiries,
      totalCount: 1,
    });
  });
});
