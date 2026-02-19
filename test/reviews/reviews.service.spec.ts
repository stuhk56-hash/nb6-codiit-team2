import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from '../../src/reviews/reviews.service';
import { ReviewsRepository } from '../../src/reviews/reviews.repository';
import { OrdersRepository } from '../../src/orders/orders.repository';
import { S3Service } from '../../src/s3/s3.service';

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewsRepository, useValue: {} },
        { provide: OrdersRepository, useValue: {} },
        { provide: S3Service, useValue: {} },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
