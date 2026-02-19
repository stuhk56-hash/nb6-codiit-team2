import { Test, TestingModule } from '@nestjs/testing';
import { CartRepository } from '../../src/modules/cart/cart.repository';

describe('CartRepository', () => {
  let repository: CartRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartRepository],
    }).compile();

    repository = module.get<CartRepository>(CartRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
