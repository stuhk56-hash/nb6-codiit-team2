import type { PriceRangeDto } from './price-range.dto';
import type { SummarySalesLogDto } from './summary-sales-log.dto';
import type { TopSalesDto } from './top-sales.dto';

export type FindDashboardResponseDto = {
  today: SummarySalesLogDto;
  week: SummarySalesLogDto;
  month: SummarySalesLogDto;
  year: SummarySalesLogDto;
  topSales: TopSalesDto[];
  priceRange: PriceRangeDto[];
};
