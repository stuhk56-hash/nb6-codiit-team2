import { Test, TestingModule } from '@nestjs/testing';
import { StoresRepository } from '../../src/stores/stores.repository';

describe('StoresRepository', () => {
  let repository: StoresRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoresRepository],
    }).compile();

    repository = module.get<StoresRepository>(StoresRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
