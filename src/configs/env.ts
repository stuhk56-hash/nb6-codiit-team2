/**
 * @description 환경 변수(ENV) 설정 모듈
 * dotenv 연결 실패 방지를 위한 기본 설정 포함
 * @date 2026-02-24
 * @version 1.0
 * @warning 코드 수정 금지!
 * 코드 수정하면 다른 팀원들 환경에서 오류 날 수 있으니 사용 안하신다면,
 * 본인 .env 파일에서 직접 설정하시길 권장합니다.
 * @see 공식문서: https://www.npmjs.com/package/dotenv
 * @see github: https://github.com/motdotla/dotenv
 **/

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1) 현재 파일 경로 (ESM 전용)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2) .env 로딩: 프로젝트 기준
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

// 3) 필수 ENV 개발용 폴백 + 운영 실패 처리
const fallback = (key: keyof NodeJS.ProcessEnv, defaultValue: string) => {
  if (process.env[key]) return process.env[key];

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[ENV] ${key} 값이 설정되지 않아 개발용 기본값(${defaultValue})을 사용합니다`,
    );
    return defaultValue;
  }
  throw new Error(`환경 변수 ${key} 값이 필요합니다`);
};

// 4) 공용 시크릿/만료 기본값
const ACCESS_SECRET: string = fallback(
  'ACCESS_SECRET',
  'change-me-access-secret',
);
const REFRESH_SECRET: string = fallback(
  'REFRESH_SECRET',
  'change-me-refresh-secret',
);
const ACCESS_EXPIRES_IN: string = process.env.ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN: string = process.env.REFRESH_EXPIRES_IN || '7d';
const JWT_SECRET: string = ACCESS_SECRET;
const JWT_EXPIRES_IN: string = ACCESS_EXPIRES_IN;

// 5) ENV 로드
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  ACCESS_SECRET,
  ACCESS_EXPIRES_IN,
  REFRESH_SECRET,
  REFRESH_EXPIRES_IN,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  DEBUG_MODE: process.env.DEBUG_MODE === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL === 'debug' ? 'debug' : 'info',
  PRISMA_QUERY_LOG: process.env.PRISMA_QUERY_LOG === 'true',
};
