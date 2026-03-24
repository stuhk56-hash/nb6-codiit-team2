/**
 * 서비스 내 유저의 역할을 정의하는 Enum입니다.
 * 피그마 UI의 '바이어(구매자)'와 '셀러(판매자)' 섹션 구분에 사용됩니다.
 */
export enum UserRole {
  /** 일반 구매자 (기본값) */
  BUYER = 'BUYER',

  /** 상품 판매자 및 대시보드 접근 권한자 */
  SELLER = 'SELLER',

  /** (선택 사항) 시스템 관리자 */
  ADMIN = 'ADMIN',
}
