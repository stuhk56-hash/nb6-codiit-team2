import type { FindDashboardResponseDto } from '../dto/find-dashboard-response.dto';
import type { PriceRangeDto } from '../dto/price-range.dto';
import type { SaleLogChangeRateDto } from '../dto/sale-log-change-rate.dto';
import type { SalesLogDto } from '../dto/sales-log.dto';
import type { SummarySalesLogDto } from '../dto/summary-sales-log.dto';
import type { TopSalesDto } from '../dto/top-sales.dto';
import type { PriceRangeSummary, TopSalesSummary } from '../types/dashboard.type';
import { calculateChangeRate } from './dashboard.util';

export function toSummarySalesLogDto(
  current: SalesLogDto,
  previous: SalesLogDto,
): SummarySalesLogDto {
  const changeRate: SaleLogChangeRateDto = {
    totalOrders: calculateChangeRate(current.totalOrders, previous.totalOrders),
    totalSales: calculateChangeRate(current.totalSales, previous.totalSales),
  };

  return {
    current,
    previous,
    changeRate,
  };
}

export function toTopSalesDto(summary: TopSalesSummary): TopSalesDto {
  return {
    totalOrders: summary.totalOrders,
    product: summary.product,
  };
}

export function toPriceRangeDto(summary: PriceRangeSummary): PriceRangeDto {
  return summary;
}

export function toFindDashboardResponseDto(data: {
  today: SummarySalesLogDto;
  week: SummarySalesLogDto;
  month: SummarySalesLogDto;
  year: SummarySalesLogDto;
  topSales: TopSalesDto[];
  priceRange: PriceRangeDto[];
}): FindDashboardResponseDto {
  return data;
}
