import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsRepository } from '../../src/reviews/reviews.repository';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('ReviewsRepository', () => {
  let repository: ReviewsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    repository = module.get<ReviewsRepository>(ReviewsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
