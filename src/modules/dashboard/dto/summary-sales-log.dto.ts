import type { SaleLogChangeRateDto } from './sale-log-change-rate.dto';
import type { SalesLogDto } from './sales-log.dto';

export type SummarySalesLogDto = {
  current: SalesLogDto;
  previous: SalesLogDto;
  changeRate: SaleLogChangeRateDto;
};
