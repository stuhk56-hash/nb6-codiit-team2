/**
 * @description CORS 설정 모듈
 * 프론트 도메인 때문에 만든 거라, 이 파일은 신경 안 쓰셔도 됩니다.
 * @date 2026-02-24
 * @version 1.0
 * @warning 코드 수정 금지!
 * @see 공식문서: https://www.npmjs.com/package/cors
 * @see github: https://github.com/expressjs/cors
 **/

import './env.js';
import cors from 'cors';

// 1) 허용 origin 목록
const allowedOrigins = [
  // 1-1) .env에서 명시한 프론트 주소
  process.env.CLIENT_URL,
  // 1-2) 개발용 주소
  process.env.BASE_URL || 'http://localhost:3000',
].filter((origin): origin is string => Boolean(origin));

// 2) CORS 설정 객체 생성
export const corsOptions = cors({
  origin: (
    origin: string | undefined,
    cb: (err: Error | null, allow?: boolean) => void,
  ) => {
    // 2-1) origin이 없는 경우 허용
    if (!origin) return cb(null, true);

    // 2-2) 허용된 도메인
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    // 2-3) 나머지는 차단
    return cb(new Error('CORS 정책에 의해 차단된 요청입니다'), false);
  },
  // 2-4) 인증/쿠키 허용 플래그
  credentials: true,
  // 2-5) 허용 HTTP 메서드 목록
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // 2-6) 허용 요청 헤더 목록
  allowedHeaders: ['Content-Type', 'Authorization'],
  // 2-7) 브라우저에 노출할 응답 헤더
  exposedHeaders: ['Set-Cookie'],
  // 2-8) 프리플라이트 성공 상태 코드 (일부 구형 브라우저 호환용)
  optionsSuccessStatus: 200,
});
