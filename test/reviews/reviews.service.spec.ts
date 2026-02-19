import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from '../../src/modules/reviews/reviews.service';
import { ReviewsRepository } from '../../src/modules/reviews/reviews.repository';
import { OrdersRepository } from '../../src/modules/orders/orders.repository';
import { S3Service } from '../../src/modules/s3/s3.service';

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
