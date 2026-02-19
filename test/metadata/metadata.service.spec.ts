import { Test, TestingModule } from '@nestjs/testing';
import { MetadataService } from '../../src/metadata/metadata.service';
import { UsersRepository } from '../../src/users/users.repository';

describe('MetadataService', () => {
  let service: MetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataService,
        { provide: UsersRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<MetadataService>(MetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
