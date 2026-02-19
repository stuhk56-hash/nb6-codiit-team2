import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../../src/modules/cart/cart.service';
import { CartRepository } from '../../src/modules/cart/cart.repository';

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService, { provide: CartRepository, useValue: {} }],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
