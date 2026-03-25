import {
  calculateChangeRate,
  getDashboardDateRanges,
  summarizePriceRanges,
  summarizeSalesRecords,
  summarizeTopSales,
} from '../utils/dashboard.util';

describe('dashboard.service.util', () => {
  test('getDashboardDateRanges는 기준 시각으로 today/week/month/year 범위를 계산한다', () => {
    const ranges = getDashboardDateRanges(new Date('2026-03-23T12:00:00.000Z'));

    expect(ranges.today.currentStart.getFullYear()).toBe(2026);
    expect(ranges.today.currentStart.getMonth()).toBe(2);
    expect(ranges.today.currentStart.getDate()).toBe(23);
    expect(ranges.today.previousStart.getDate()).toBe(22);
    expect(ranges.week.currentStart.getDate()).toBe(23);
    expect(ranges.month.currentStart.getMonth()).toBe(2);
    expect(ranges.month.currentStart.getDate()).toBe(1);
    expect(ranges.year.currentStart.getMonth()).toBe(0);
    expect(ranges.year.currentStart.getDate()).toBe(1);
  });

  test('summarizeSalesRecords와 calculateChangeRate는 기간 매출/증감률을 계산한다', () => {
    const records = [
      {
        createdAt: new Date('2026-03-23T01:00:00.000Z'),
        quantity: 2,
        unitPrice: 10000,
        product: { id: 'p1', name: '상품1', price: 10000 },
      },
      {
        createdAt: new Date('2026-03-22T01:00:00.000Z'),
        quantity: 1,
        unitPrice: 15000,
        product: { id: 'p2', name: '상품2', price: 15000 },
      },
    ];

    const current = summarizeSalesRecords(
      records,
      new Date('2026-03-23T00:00:00.000Z'),
      new Date('2026-03-24T00:00:00.000Z'),
    );
    const previous = summarizeSalesRecords(
      records,
      new Date('2026-03-22T00:00:00.000Z'),
      new Date('2026-03-23T00:00:00.000Z'),
    );

    expect(current).toEqual({
      totalOrders: 2,
      totalSales: 20000,
    });
    expect(previous).toEqual({
      totalOrders: 1,
      totalSales: 15000,
    });
    expect(calculateChangeRate(2, 1)).toBe(100);
    expect(calculateChangeRate(0, 0)).toBe(0);
  });

  test('summarizeTopSales와 summarizePriceRanges는 판매 순위와 가격대 비중을 계산한다', () => {
    const records = [
      {
        createdAt: new Date('2026-03-23T01:00:00.000Z'),
        quantity: 3,
        unitPrice: 9000,
        product: { id: 'p1', name: '저가상품', price: 9000 },
      },
      {
        createdAt: new Date('2026-03-23T02:00:00.000Z'),
        quantity: 2,
        unitPrice: 30000,
        product: { id: 'p2', name: '중가상품', price: 30000 },
      },
      {
        createdAt: new Date('2026-03-23T03:00:00.000Z'),
        quantity: 1,
        unitPrice: 30000,
        product: { id: 'p2', name: '중가상품', price: 30000 },
      },
    ];

    const topSales = summarizeTopSales(records);
    const priceRanges = summarizePriceRanges(records);

    expect(topSales[0]).toEqual({
      totalOrders: 3,
      totalSales: 90000,
      product: { id: 'p2', name: '중가상품', price: 30000 },
    });
    expect(topSales[1].product.id).toBe('p1');
    expect(priceRanges[0].priceRange).toBe('만원 이하');
    expect(priceRanges[0].totalSales).toBe(27000);
    expect(priceRanges[1].priceRange).toBe('1만원 초과 3만원 이하');
    expect(priceRanges[1].totalSales).toBe(0);
    expect(priceRanges[2].priceRange).toBe('3만원 초과 5만원 이하');
    expect(priceRanges[2].totalSales).toBe(90000);
  });
});
