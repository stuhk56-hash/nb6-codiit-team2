import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

describe('UsersRepository', () => {
  let repository: Repository<User>;

  // 가짜(Mock) Repository 생성
  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findByRole', () => {
    it('특정 역할(SELLER)을 가진 유저를 조회해야 한다', async () => {
      const sellerUser = {
        id: 1,
        email: 'seller@test.com',
        role: UserRole.SELLER,
      };
      mockRepository.findOne.mockResolvedValue(sellerUser);

      const result = await repository.findOne({
        where: { role: UserRole.SELLER },
      });

      expect(result.role).toEqual(UserRole.SELLER);
      expect(mockRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('updateUserProfile', () => {
    it('피그마 프로필 수정 폼의 데이터를 DB에 반영해야 한다', async () => {
      const updateData = {
        nickname: '새로운닉네임',
        phoneNumber: '010-1234-5678',
      };
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await repository.update(1, updateData);

      expect(result.affected).toBe(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('Seller Dashboard Query', () => {
    it('셀러의 판매 통계 데이터를 위한 쿼리가 정상 작동해야 한다', async () => {
      // 피그마 셀러 섹션의 그래프 데이터를 가져오기 위한 QueryBuilder 테스트 예시
      const qr = mockRepository.createQueryBuilder();
      qr.where.mockReturnThis();
      qr.getMany.mockResolvedValue([{ id: 1, salesAmount: 1000 }]);

      const result = await qr
        .where('user.role = :role', { role: 'SELLER' })
        .getMany();

      expect(result[0].salesAmount).toBeGreaterThan(0);
    });
  });
});
