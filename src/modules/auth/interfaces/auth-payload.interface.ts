/*2026-03-23*/
export interface AuthPayload {
  id: string; // 유저의 고유 ID (CUID 등)
  email: string; // 유저 이메일
  type: string; // BUYER 또는 SELLER (피그마 권한 분기용)
  // iat, exp 등은 JWT 라이브러리가 자동으로 추가함
}
