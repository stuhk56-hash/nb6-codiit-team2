/**
 * @description Winston 기반 로거 설정 모듈
 * 에러 추적 및 로그 관리를 위해 사용됩니다.
 * @date 2026-02-24
 * @version 1.0
 * @warning 코드 수정 금지!
 * @see github: https://github.com/winstonjs/winston#readme
 **/

import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    printf(({ level, message, timestamp: ts, stack, ...meta }) => {
      const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return stack
        ? `[${ts}] ${level}: ${message} ${rest}\n${stack}`
        : `[${ts}] ${level}: ${message}${rest}`;
    }),
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp(), errors({ stack: true })),
    }),
  ],
});
