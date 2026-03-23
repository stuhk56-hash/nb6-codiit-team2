import { UserUtil } from './users.service.util';

describe('UserUtil', () => {
  // 1. 피그마 'text fields' 입력값 정제 테스트
  describe('formatPhoneNumber', () => {
    it('숫자만 있는 전화번호에 하이픈을 추가해야 한다', () => {
      const input = '01012345678';
      const expected = '010-1234-5678';
      expect(UserUtil.formatPhoneNumber(input)).toBe(expected);
    });

    it('이미 하이픈이 있는 경우 그대로 반환해야 한다', () => {
      const input = '010-1234-5678';
      expect(UserUtil.formatPhoneNumber(input)).toBe(input);
    });
  });

  // 2. 피그마 셀러 대시보드 통계 수치 포맷팅
  describe('formatCurrency', () => {
    it('숫자를 한국 원화 형식으로 변환해야 한다', () => {
      const amount = 1500000;
      const expected = '1,500,000원';
      expect(UserUtil.formatCurrency(amount)).toBe(expected);
    });
  });

  // 3. 피그마 공통 섹션 - 개인정보 마스킹 (이메일 등)
  describe('maskEmail', () => {
    it('이메일 주소의 일부를 별표(*)로 숨겨야 한다', () => {
      const email = 'gemini123@google.com';
      const result = UserUtil.maskEmail(email);

      // 결과 예시: gem***@google.com
      expect(result).toContain('***');
      expect(result).toContain('@google.com');
      expect(result.startsWith('gem')).toBeTruthy();
    });
  });

  // 4. 피그마 에러 페이지 대응 - 에러 메시지 가공
  describe('getFriendlyErrorMessage', () => {
    it('시스템 에러 코드를 사용자 친화적인 메시지로 변환해야 한다', () => {
      const errorCode = 'AUTH_001';
      const result = UserUtil.getFriendlyErrorMessage(errorCode);

      expect(result).toBe('아이디 또는 비밀번호가 일치하지 않습니다.');
    });
  });
});
