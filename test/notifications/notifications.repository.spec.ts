import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsRepository } from '../../src/notifications/notifications.repository';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('NotificationsRepository', () => {
  let repository: NotificationsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    repository = module.get<NotificationsRepository>(NotificationsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
