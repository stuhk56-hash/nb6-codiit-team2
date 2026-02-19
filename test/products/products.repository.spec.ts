import { Test, TestingModule } from '@nestjs/testing';
import { ProductsRepository } from '../../src/products/products.repository';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsRepository],
    }).compile();

    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
