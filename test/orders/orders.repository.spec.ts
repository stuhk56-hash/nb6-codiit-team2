import { Test, TestingModule } from '@nestjs/testing';
import { OrdersRepository } from '../../src/orders/orders.repository';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    repository = module.get<OrdersRepository>(OrdersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
