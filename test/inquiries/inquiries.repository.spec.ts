import { Test, TestingModule } from '@nestjs/testing';
import { InquiriesRepository } from '../../src/inquiries/inquiries.repository';

describe('InquiriesRepository', () => {
  let repository: InquiriesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InquiriesRepository],
    }).compile();

    repository = module.get<InquiriesRepository>(InquiriesRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
