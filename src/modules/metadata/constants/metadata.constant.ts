import { UserGradeId, UserGradeName } from '../../users/enums/user-grade.enum';

export const METADATA_CONSTANTS = {
  // --- 1. 등급(Grade) 기본 설정값 ---
  // 피그마 UI에 표시되는 등급별 실제 수치 및 정책을 정의합니다.
  GRADES: {
    [UserGradeName.GREEN]: {
      id: UserGradeId.GREEN,
      name: UserGradeName.GREEN,
      rate: 1, // 1% 적립
      minAmount: 0, // 가입 즉시 부여
      color: '#4CAF50', // 피그마 디자인 가이드 컬러 (Green)
    },
    [UserGradeName.SILVER]: {
      id: UserGradeId.SILVER,
      name: UserGradeName.SILVER,
      rate: 3, // 3% 적립
      minAmount: 100000, // 누적 10만원 이상
      color: '#9E9E9E', // Silver 컬러
    },
    [UserGradeName.GOLD]: {
      id: UserGradeId.GOLD,
      name: UserGradeName.GOLD,
      rate: 5, // 5% 적립
      minAmount: 500000, // 누적 50만원 이상
      color: '#FFC107', // Gold 컬러
    },
    [UserGradeName.VIP]: {
      id: UserGradeId.VIP,
      name: UserGradeName.VIP,
      rate: 10, // 10% 적립
      minAmount: 1000000, // 누적 100만원 이상
      color: '#9C27B0', // VIP 컬러
    },
  },

  // --- 2. 카테고리 또는 기타 공통 코드 (필요 시 확장) ---
  CATEGORIES: {
    DEFAULT_LIMIT: 10,
    MAX_DEPTH: 3,
  },

  // --- 3. 에러 메시지 ---
  ERROR_MESSAGES: {
    GRADE_NOT_FOUND: '해당 등급 정보를 찾을 수 없습니다.',
    INVALID_METADATA: '유효하지 않은 메타데이터 요청입니다.',
  },
} as const;
