import { NotFoundError } from '../../../lib/errors/customErrors';
import { requireSeller } from '../../../lib/request/auth-user';
import { dashboardRepository } from '../dashboard.repository';
import { DashboardService } from '../dashboard.service';

jest.mock('../../../lib/request/auth-user', () => ({
  requireSeller: jest.fn(),
}));

jest.mock('../dashboard.repository', () => ({
  dashboardRepository: {
    findStoreBySellerId: jest.fn(),
    findSalesRecordsBySellerId: jest.fn(),
  },
}));

describe('dashboard.service', () => {
  const service = new DashboardService();
  const mockedRepository = dashboardRepository as jest.Mocked<
    typeof dashboardRepository
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('기간별 요약 지표 계산 로직을 검증한다', async () => {
    mockedRepository.findStoreBySellerId.mockResolvedValue({ id: 'store-1' } as any);
    mockedRepository.findSalesRecordsBySellerId.mockResolvedValue([
      {
        createdAt: new Date(),
        quantity: 2,
        unitPrice: 10000,
        product: {
          id: 'product-1',
          name: '상품1',
          price: 10000,
        },
      },
    ] as any);

    const result = await service.findDashboard({
      id: 'seller-1',
      type: 'SELLER',
    } as any);

    expect(requireSeller).toHaveBeenCalledWith({
      id: 'seller-1',
      type: 'SELLER',
    });
    expect(mockedRepository.findStoreBySellerId).toHaveBeenCalledWith('seller-1');
    expect(mockedRepository.findSalesRecordsBySellerId).toHaveBeenCalledWith(
      'seller-1',
    );
    expect(result.today.current.totalOrders).toBe(2);
    expect(result.today.current.totalSales).toBe(20000);
    expect(result.today.previous.totalOrders).toBe(0);
  });

  test('topSales/priceRange 매핑을 검증한다', async () => {
    mockedRepository.findStoreBySellerId.mockResolvedValue({ id: 'store-1' } as any);
    mockedRepository.findSalesRecordsBySellerId.mockResolvedValue([
      {
        createdAt: new Date(),
        quantity: 3,
        unitPrice: 9000,
        product: {
          id: 'product-1',
          name: '저가 상품',
          price: 9000,
        },
      },
      {
        createdAt: new Date(),
        quantity: 1,
        unitPrice: 30000,
        product: {
          id: 'product-2',
          name: '중가 상품',
          price: 30000,
        },
      },
    ] as any);

    const result = await service.findDashboard({
      id: 'seller-1',
      type: 'SELLER',
    } as any);

    expect(result.topSales[0].product.id).toBe('product-1');
    expect(result.topSales[0].totalOrders).toBe(3);
    expect(result.priceRange[0].priceRange).toBe('만원 이하');
    expect(result.priceRange[0].totalSales).toBe(27000);
    expect(result.priceRange[2].priceRange).toBe('3만원 초과 5만원 이하');
    expect(result.priceRange[2].totalSales).toBe(30000);
  });

  test('스토어가 없으면 NotFoundError를 던진다', async () => {
    mockedRepository.findStoreBySellerId.mockResolvedValue(null);

    await expect(
      service.findDashboard({ id: 'seller-1', type: 'SELLER' } as any),
    ).rejects.toThrow(NotFoundError);
  });
});
