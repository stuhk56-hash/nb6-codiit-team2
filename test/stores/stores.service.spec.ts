import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from '../../src/modules/stores/stores.service';
import { StoresRepository } from '../../src/modules/stores/stores.repository';

describe('StoresService', () => {
  let service: StoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoresService, { provide: StoresRepository, useValue: {} }],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
