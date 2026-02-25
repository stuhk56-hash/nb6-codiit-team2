/**
 * @description Prisma Client 설정 모듈
 * @date 2026-02-24
 * @version 1.0
 * @warning 코드 수정 금지!
 * @see 공식문서: https://www.npmjs.com/package/prisma
 * @see github: https://github.com/prisma/prisma
 **/

import './env.js';
import { PrismaClient } from '@prisma/client';
import { logger } from '../errors/logger.js';
import chalk from 'chalk';

// 2) 새로운 PrismaClient 생성
const prisma = new PrismaClient({
  // 3) 로그 옵션
  log:
    process.env.DEBUG_MODE === 'true'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'error' },
        ]
      : [{ emit: 'event', level: 'error' }],
});

// 3-1) Prisma 이벤트 로거 — 읽기 쉬운 포맷
const logQueries =
  process.env.DEBUG_MODE === 'true' || process.env.PRISMA_QUERY_LOG === 'true';

if (logQueries) {
  prisma.$on('query', (e) => {
    logger.info(
      [
        chalk.cyan.bold('🧭 PRISMA QUERY'),
        `  query:\n    ${chalk.gray(e.query)}`,
        `  params:\n    ${chalk.yellow(e.params)}`,
        `  duration:\n    ${chalk.magenta(`${e.duration}ms`)}`,
      ].join('\n'),
    );
  });
}

prisma.$on('info', (e) => {
  logger.info(chalk.blue.bold('ℹ️ PRISMA INFO'), { message: e.message });
});

prisma.$on('warn', (e) => {
  logger.warn(chalk.yellow.bold('⚠️ PRISMA WARN'), { message: e.message });
});

prisma.$on('error', (e) => {
  logger.error(chalk.red.bold('💥 PRISMA ERROR'), { message: e.message });
});

export default prisma;
