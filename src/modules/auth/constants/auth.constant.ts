export const AUTH_CONSTANTS = {
  // --- 1. JWT 설정 (토큰 발급 및 검증 관련) ---
  JWT: {
    // 실제 운영 환경에서는 반드시 .env 파일에서 가져와야 함 (process.env.JWT_SECRET)
    SECRET: 'your-super-secret-key-change-me',

    // Access Token 만료 시간 (피그마 세션 유지 정책에 따라 조정)
    ACCESS_TOKEN_EXPIRES_IN: '1h', // 1시간

    // Refresh Token 만료 시간 (장기 로그인 유지용)
    REFRESH_TOKEN_EXPIRES_IN: '7d', // 7일
  },

  // --- 2. 보안 설정 (비밀번호 암호화 관련) ---
  SECURITY: {
    // bcrypt 해싱 강도 (숫자가 높을수록 보안강화/연산속도 저하)
    SALT_ROUNDS: 10,
  },

  // --- 3. 쿠키 설정 (만약 쿠키 방식을 사용할 경우) ---
  COOKIE: {
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'strict',
  },

  // --- 4. 에러 메시지 (피그마 로그인 에러 대응용) ---
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: '이메일 또는 비밀번호가 일치하지 않습니다.',
    TOKEN_EXPIRED: '인증 토큰이 만료되었습니다. 다시 로그인해주세요.',
    UNAUTHORIZED: '로그인이 필요한 서비스입니다.',
    INVALID_TOKEN: '유효하지 않은 인증 토큰입니다.',
  },
} as const;
