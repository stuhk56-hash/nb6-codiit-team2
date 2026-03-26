import type { SalesLogDto } from '../dto/sales-log.dto';
import type {
  DashboardDateRange,
  DashboardPeriodKey,
  DashboardSalesRecord,
  PriceRangeBucket,
  PriceRangeSummary,
  TopSalesSummary,
} from '../types/dashboard.type';

export const DASHBOARD_TOP_SALES_LIMIT = 5;

export const PRICE_RANGE_BUCKETS: PriceRangeBucket[] = [
  { label: '만원 이하', min: 0, max: 10000 },
  { label: '1만원 초과 3만원 이하', min: 10000, max: 30000 },
  { label: '3만원 초과 5만원 이하', min: 30000, max: 50000 },
  { label: '5만원 초과 10만원 이하', min: 50000, max: 100000 },
  { label: '10만원 초과', min: 100000, max: Number.POSITIVE_INFINITY },
];

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, diff));
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function addYears(date: Date, amount: number): Date {
  return new Date(date.getFullYear() + amount, 0, 1);
}

export function getDashboardDateRanges(
  now = new Date(),
): Record<DashboardPeriodKey, DashboardDateRange> {
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const weekStart = startOfWeek(now);
  const nextWeekStart = addDays(weekStart, 7);
  const monthStart = startOfMonth(now);
  const nextMonthStart = addMonths(monthStart, 1);
  const yearStart = startOfYear(now);
  const nextYearStart = addYears(yearStart, 1);

  return {
    today: {
      currentStart: todayStart,
      currentEnd: tomorrowStart,
      previousStart: addDays(todayStart, -1),
      previousEnd: todayStart,
    },
    week: {
      currentStart: weekStart,
      currentEnd: nextWeekStart,
      previousStart: addDays(weekStart, -7),
      previousEnd: weekStart,
    },
    month: {
      currentStart: monthStart,
      currentEnd: nextMonthStart,
      previousStart: addMonths(monthStart, -1),
      previousEnd: monthStart,
    },
    year: {
      currentStart: yearStart,
      currentEnd: nextYearStart,
      previousStart: addYears(yearStart, -1),
      previousEnd: yearStart,
    },
  };
}

export function summarizeSalesRecords(
  records: DashboardSalesRecord[],
  start: Date,
  end: Date,
): SalesLogDto {
  return records.reduce<SalesLogDto>(
    (summary, record) => {
      if (record.createdAt < start || record.createdAt >= end) {
        return summary;
      }

      summary.totalOrders += record.quantity;
      summary.totalSales += record.unitPrice * record.quantity;
      return summary;
    },
    {
      totalOrders: 0,
      totalSales: 0,
    },
  );
}

export function calculateChangeRate(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Math.round(((current - previous) / previous) * 100);
}

export function summarizeTopSales(
  records: DashboardSalesRecord[],
): TopSalesSummary[] {
  const summaryByProduct = new Map<string, TopSalesSummary>();

  for (const record of records) {
    const current = summaryByProduct.get(record.product.id);
    const totalSales = record.unitPrice * record.quantity;

    if (current) {
      current.totalOrders += record.quantity;
      current.totalSales += totalSales;
      continue;
    }

    summaryByProduct.set(record.product.id, {
      totalOrders: record.quantity,
      totalSales,
      product: record.product,
    });
  }

  return [...summaryByProduct.values()]
    .sort(
      (left, right) =>
        right.totalOrders - left.totalOrders ||
        right.totalSales - left.totalSales,
    )
    .slice(0, DASHBOARD_TOP_SALES_LIMIT);
}

export function summarizePriceRanges(
  records: DashboardSalesRecord[],
): PriceRangeSummary[] {
  const totalSales = records.reduce(
    (sum, record) => sum + record.unitPrice * record.quantity,
    0,
  );

  return PRICE_RANGE_BUCKETS.map((bucket) => {
    const bucketTotalSales = records.reduce((sum, record) => {
      if (record.unitPrice < bucket.min || record.unitPrice >= bucket.max) {
        return sum;
      }

      return sum + record.unitPrice * record.quantity;
    }, 0);

    return {
      priceRange: bucket.label,
      totalSales: bucketTotalSales,
      percentage:
        totalSales === 0
          ? 0
          : Number(((bucketTotalSales / totalSales) * 100).toFixed(1)),
    };
  });
}
