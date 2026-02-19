import { Test, TestingModule } from '@nestjs/testing';
import { InquiriesService } from '../../src/inquiries/inquiries.service';
import { InquiriesRepository } from '../../src/inquiries/inquiries.repository';

describe('InquiriesService', () => {
  let service: InquiriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiriesService,
        { provide: InquiriesRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<InquiriesService>(InquiriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
