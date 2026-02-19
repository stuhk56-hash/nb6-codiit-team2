import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { NotificationsRepository } from '../../src/notifications/notifications.repository';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationsRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
