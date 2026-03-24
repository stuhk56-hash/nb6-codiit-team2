import { MetadataMapper } from '../utils/metadata.mapper';
import { Grade } from '../entities/grade.entity';
import { UserGradeId, UserGradeName } from '../../users/enums/user-grade.enum';

describe('MetadataMapper', () => {
  // 테스트용 가짜(Mock) 엔티티 데이터
  const mockGradeEntity: Grade = {
    id: UserGradeId.GOLD,
    name: UserGradeName.GOLD,
    rate: 5,
    minAmount: 500000,
    color: '#FFC107',
    users: [], // 관계 필드는 빈 배열 처리
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  } as Grade;

  describe('toResponseDto', () => {
    it('Grade 엔티티를 UI용 DTO로 올바르게 변환해야 한다', () => {
      const result = MetadataMapper.toResponseDto(mockGradeEntity);

      // 1. 기본 필드 검증
      expect(result.id).toBe(UserGradeId.GOLD);
      expect(result.name).toBe(UserGradeName.GOLD);
      expect(result.color).toBe('#FFC107');

      // 2. 가공된 필드 검증 (피그마 UI용 텍스트)
      // 예: 5 -> "5%", 500000 -> "500,000원" 등 매퍼 로직에 따라 테스트
      expect(result.rateLabel).toBe('5%');
      expect(result.minAmountLabel).toContain('500,000');
    });

    it('엔티티가 null인 경우 null을 반환해야 한다', () => {
      const result = MetadataMapper.toResponseDto(null);
      expect(result).toBeNull();
    });
  });

  describe('toResponseDtoList', () => {
    it('엔티티 배열을 DTO 배열로 모두 변환해야 한다', () => {
      const mockList: Grade[] = [
        mockGradeEntity,
        {
          ...mockGradeEntity,
          id: UserGradeId.VIP,
          name: UserGradeName.VIP,
        } as Grade,
      ];

      const result = MetadataMapper.toResponseDtoList(mockList);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(UserGradeId.GOLD);
      expect(result[1].id).toBe(UserGradeId.VIP);
    });

    it('빈 배열이 들어오면 빈 배열을 반환해야 한다', () => {
      const result = MetadataMapper.toResponseDtoList([]);
      expect(result).toEqual([]);
    });
  });
});
