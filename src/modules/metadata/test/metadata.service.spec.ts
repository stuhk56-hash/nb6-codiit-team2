import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetadataService } from '../metadata.service';
import { MetadataSeedService } from '../metadata.seed';
import { Grade } from '../entities/grade.entity';
import { UserGradeId, UserGradeName } from '../../users/enums/user-grade.enum';
import { METADATA_CONSTANTS } from '../constants/metadata.constant';

describe('Metadata (Service & Seed)', () => {
  let service: MetadataService;
  let seedService: MetadataSeedService;
  let repository: Repository<Grade>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataService,
        MetadataSeedService,
        {
          provide: getRepositoryToken(Grade),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MetadataService>(MetadataService);
    seedService = module.get<MetadataSeedService>(MetadataSeedService);
    repository = module.get<Repository<Grade>>(getRepositoryToken(Grade));
  });

  describe('seedGrades', () => {
    it('DB에 등급이 없으면 상수에 정의된 모든 등급을 생성해야 한다', async () => {
      // 1. 기존 데이터 없음 설정
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockImplementation((dto) => dto as any);

      await seedService.seedGrades();

      // 2. 상수에 정의된 개수만큼 save가 호출되었는지 확인
      const gradeCount = Object.keys(METADATA_CONSTANTS.GRADES).length;
      expect(repository.save).toHaveBeenCalledTimes(gradeCount);
    });

    it('이미 등급이 존재하면 정보를 업데이트(동기화)해야 한다', async () => {
      const existingGrade = { id: UserGradeId.GREEN, rate: 1 };
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(existingGrade as Grade);

      await seedService.seedGrades();

      // 기존 등급을 찾아서 업데이트하는지 확인
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: UserGradeId.GREEN }),
      );
    });
  });

  describe('getGradeById', () => {
    it('특정 ID로 등급 조회 시 해당 엔티티를 반환해야 한다', async () => {
      const mockGrade = {
        id: UserGradeId.GOLD,
        name: UserGradeName.GOLD,
        rate: 5,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockGrade as Grade);

      const result = await service.getGradeById(UserGradeId.GOLD);

      expect(result.name).toBe(UserGradeName.GOLD);
      expect(result.rate).toBe(5);
    });
  });
});
