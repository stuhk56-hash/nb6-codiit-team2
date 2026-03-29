import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  // Mock Service: 실제 DB를 건드리지 않도록 가짜 서비스 생성
  const mockUsersService = {
    findOne: jest.fn(),
    updateProfile: jest.fn(),
    getSellerStatistics: jest.fn(), // 피그마 셀러 대시보드용
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- 1. 바이어/셀러 공통 프로필 조회 ---
  describe('getProfile', () => {
    it('유저 ID로 프로필 정보를 성공적으로 반환해야 한다 (200 OK)', async () => {
      const result = { id: 1, email: 'user@test.com', role: 'BUYER' };
      mockUsersService.findOne.mockResolvedValue(result);

      expect(await controller.getProfile(1)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  // --- 2. 셀러 전용 대시보드 데이터 (피그마 셀러 섹션 반영) ---
  describe('getSellerDashboard', () => {
    it('셀러 권한 확인 후 대시보드 통계를 반환해야 한다', async () => {
      const stats = { totalSales: 500000, orderCount: 15 };
      mockUsersService.getSellerStatistics.mockResolvedValue(stats);

      const response = await controller.getSellerDashboard(1);

      expect(response).toEqual(stats);
      expect(service.getSellerStatistics).toHaveBeenCalled();
    });
  });

  // --- 3. 에러 처리 (피그마 에러 페이지 섹션 반영) ---
  describe('Error Handling', () => {
    it('존재하지 않는 유저 조회 시 404 에러를 던져야 한다', async () => {
      mockUsersService.findOne.mockRejectedValue(new Error('NotFound'));

      await expect(controller.getProfile(999)).rejects.toThrow();
    });
  });
});
