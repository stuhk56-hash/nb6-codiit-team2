export const USER_CONSTANTS = {
  // --- 1. 유효성 검사 (피그마 Text Fields 관련) ---
  VALIDATION: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 20,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 20,
    NICKNAME_MAX_LENGTH: 15,
  },

  // --- 2. 기본 리소스 (피그마 Navigation/Profile 관련) ---
  ASSETS: {
    DEFAULT_PROFILE_IMAGE:
      'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/1749477485230-user_default.png',
  },

  // --- 3. 등급 및 포인트 (피그마 Buyer Dashboard 관련) ---
  GRADE: {
    DEFAULT_ID: 'grade_green',
    DEFAULT_NAME: 'green',
    INITIAL_POINTS: 0,
  },

  // --- 4. 파일 업로드 제한 (users.upload.ts 관련) ---
  UPLOAD: {
    MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // --- 5. 에러 메시지 (피그마 에러 페이지 대응용) ---
  ERROR_MESSAGES: {
    NOT_FOUND: '존재하지 않는 사용자입니다.',
    ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
    FORBIDDEN_SELLER_ONLY: '판매자 권한이 필요한 서비스입니다.',
    INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다. (JPG, PNG만 가능)',
  },
} as const; // readonly로 설정하여 값 변경 방지
