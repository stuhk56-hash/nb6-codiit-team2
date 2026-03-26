/* eslint-disable no-console */
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 내부 정책: 회원 탈퇴(deletedAt) 후 30일 경과 시 판매자 민감정보 파기
const STORE_BUSINESS_INFO_RETENTION_DAYS = 30;
const STORE_AUDIT_LOG_RETENTION_DAYS = 365;

function getCutoffDate(retentionDays) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  return cutoff;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const businessInfoCutoff = getCutoffDate(STORE_BUSINESS_INFO_RETENTION_DAYS);
  const auditLogCutoff = getCutoffDate(STORE_AUDIT_LOG_RETENTION_DAYS);

  const targets = await prisma.store.findMany({
    where: {
      seller: {
        deletedAt: {
          lte: businessInfoCutoff,
        },
      },
      OR: [
        { representativeName: { not: null } },
        { businessRegistrationNumber: { not: null } },
        { mailOrderSalesNumber: { not: null } },
        { businessPhoneNumber: { not: null } },
        { businessAddress: { not: null } },
      ],
    },
    select: {
      id: true,
      sellerId: true,
    },
  });

  console.log(
    `[store:purge] policy=${STORE_BUSINESS_INFO_RETENTION_DAYS}d cutoff=${businessInfoCutoff.toISOString()} targets=${targets.length} dryRun=${dryRun}`,
  );

  if (!targets.length) {
    return;
  }

  if (dryRun) {
    console.log('[store:purge] target store ids:', targets.map((s) => s.id));
    const auditCount = await prisma.storeAuditLog.count({
      where: {
        createdAt: {
          lte: auditLogCutoff,
        },
      },
    });
    console.log(
      `[store:purge] audit-log targets=${auditCount} retention=${STORE_AUDIT_LOG_RETENTION_DAYS}d cutoff=${auditLogCutoff.toISOString()}`,
    );
    return;
  }

  const targetIds = targets.map((s) => s.id);
  const result = await prisma.store.updateMany({
    where: {
      id: { in: targetIds },
    },
    data: {
      representativeName: null,
      businessRegistrationNumber: null,
      mailOrderSalesNumber: null,
      businessPhoneNumber: null,
      businessAddress: null,
    },
  });

  console.log(`[store:purge] purged=${result.count}`);

  const auditResult = await prisma.storeAuditLog.deleteMany({
    where: {
      createdAt: {
        lte: auditLogCutoff,
      },
    },
  });

  console.log(
    `[store:purge] audit-log purged=${auditResult.count} (retention=${STORE_AUDIT_LOG_RETENTION_DAYS}d, cutoff=${auditLogCutoff.toISOString()})`,
  );
}

main()
  .catch((error) => {
    console.error('[store:purge] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
