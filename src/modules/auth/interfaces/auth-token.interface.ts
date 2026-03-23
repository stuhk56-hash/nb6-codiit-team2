/*2026-03-23*/
export interface AuthToken {
  accessToken: string;
  refreshToken?: string; // 리프레시 토큰 사용 시 추가
  expiresIn: number; // 만료 시간 (초 단위 등)
}
