import { prisma } from '../../../lib/constants/prismaClient';

const STORE_BUSINESS_INFO_RETENTION_DAYS = 30;
const STORE_AUDIT_LOG_RETENTION_DAYS = 365;
const TARGET_WEEKDAY = 1; // 월요일
const TARGET_HOUR = 3; // 새벽 3시

let scheduledTimer: NodeJS.Timeout | null = null;
let running = false;

function getCutoffDate(now: Date, retentionDays: number) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  return cutoff;
}

function getNextRunDate(now: Date) {
  const next = new Date(now);
  next.setHours(TARGET_HOUR, 0, 0, 0);

  const currentWeekday = now.getDay(); // 0(일)~6(토)
  let daysUntilTarget = (TARGET_WEEKDAY - currentWeekday + 7) % 7;

  if (daysUntilTarget === 0 && now >= next) {
    daysUntilTarget = 7;
  }

  next.setDate(now.getDate() + daysUntilTarget);
  next.setHours(TARGET_HOUR, 0, 0, 0);
  return next;
}

async function runStoreBusinessInfoPurge() {
  if (running) {
    return;
  }
  running = true;

  try {
    const now = new Date();
    const businessInfoCutoff = getCutoffDate(
      now,
      STORE_BUSINESS_INFO_RETENTION_DAYS,
    );
    const auditLogCutoff = getCutoffDate(now, STORE_AUDIT_LOG_RETENTION_DAYS);

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
      select: { id: true },
    });

    if (!targets.length) {
      console.log(
        `[store:purge] no business-info targets (retention=${STORE_BUSINESS_INFO_RETENTION_DAYS}d, cutoff=${businessInfoCutoff.toISOString()})`,
      );
    } else {
      const result = await prisma.store.updateMany({
        where: {
          id: {
            in: targets.map((store) => store.id),
          },
        },
        data: {
          representativeName: null,
          businessRegistrationNumber: null,
          mailOrderSalesNumber: null,
          businessPhoneNumber: null,
          businessAddress: null,
        },
      });

      console.log(
        `[store:purge] business-info purged=${result.count} (retention=${STORE_BUSINESS_INFO_RETENTION_DAYS}d, cutoff=${businessInfoCutoff.toISOString()})`,
      );
    }

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
  } catch (error) {
    console.error('[store:purge] job failed:', error);
  } finally {
    running = false;
    scheduleNextStoreBusinessInfoPurge();
  }
}

function scheduleNextStoreBusinessInfoPurge() {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }

  const now = new Date();
  const nextRun = getNextRunDate(now);
  const delay = Math.max(nextRun.getTime() - now.getTime(), 1000);

  console.log(`[store:purge] next run at ${nextRun.toISOString()}`);
  scheduledTimer = setTimeout(() => {
    void runStoreBusinessInfoPurge();
  }, delay);
}

export function startStoreBusinessInfoPurgeScheduler() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  scheduleNextStoreBusinessInfoPurge();
}
