import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../../src/modules/dashboard/dashboard.service';
import { OrdersRepository } from '../../src/modules/orders/orders.repository';
import { ProductsRepository } from '../../src/modules/products/products.repository';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: OrdersRepository, useValue: {} },
        { provide: ProductsRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
