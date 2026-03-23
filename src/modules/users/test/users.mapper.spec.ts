import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper();
  });

  describe('toResponseDTO', () => {
    it('구매자 정보를 UI 포맷에 맞춰 변환해야 한다', () => {
      // 1. Given: 가상의 DB 유저 데이터
      // 2. When: mapper 실행
      // 3. Then: 피그마 상단 네비게이션에 필요한 정보가 있는지 확인
    });

    it('판매자 전용 필드(상점 정보 등)가 누락 없이 매핑되어야 한다', () => {
      // 셀러 페이지의 통계 대시보드 데이터 매핑 검증
    });
  });
});
