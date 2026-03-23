import { NotFoundError } from '../../lib/errors/customErrors';
import { requireSeller } from '../../lib/request/auth-user';
import type { AuthUser } from '../../types/auth-request.type';
import type { FindDashboardResponseDto } from './dto/find-dashboard-response.dto';
import { dashboardRepository } from './dashboard.repository';
import {
  toFindDashboardResponseDto,
  toPriceRangeDto,
  toSummarySalesLogDto,
  toTopSalesDto,
} from './utils/dashboard.mapper';
import {
  getDashboardDateRanges,
  summarizePriceRanges,
  summarizeSalesRecords,
  summarizeTopSales,
} from './utils/dashboard.util';

export class DashboardService {
  async findDashboard(user: AuthUser): Promise<FindDashboardResponseDto> {
    requireSeller(user);

    const store = await dashboardRepository.findStoreBySellerId(user.id);
    if (!store) {
      throw new NotFoundError('스토어를 찾을 수 없습니다.');
    }

    const salesRecords = await dashboardRepository.findSalesRecordsBySellerId(
      user.id,
    );
    const dateRanges = getDashboardDateRanges();

    const today = toSummarySalesLogDto(
      summarizeSalesRecords(
        salesRecords,
        dateRanges.today.currentStart,
        dateRanges.today.currentEnd,
      ),
      summarizeSalesRecords(
        salesRecords,
        dateRanges.today.previousStart,
        dateRanges.today.previousEnd,
      ),
    );
    const week = toSummarySalesLogDto(
      summarizeSalesRecords(
        salesRecords,
        dateRanges.week.currentStart,
        dateRanges.week.currentEnd,
      ),
      summarizeSalesRecords(
        salesRecords,
        dateRanges.week.previousStart,
        dateRanges.week.previousEnd,
      ),
    );
    const month = toSummarySalesLogDto(
      summarizeSalesRecords(
        salesRecords,
        dateRanges.month.currentStart,
        dateRanges.month.currentEnd,
      ),
      summarizeSalesRecords(
        salesRecords,
        dateRanges.month.previousStart,
        dateRanges.month.previousEnd,
      ),
    );
    const year = toSummarySalesLogDto(
      summarizeSalesRecords(
        salesRecords,
        dateRanges.year.currentStart,
        dateRanges.year.currentEnd,
      ),
      summarizeSalesRecords(
        salesRecords,
        dateRanges.year.previousStart,
        dateRanges.year.previousEnd,
      ),
    );

    return toFindDashboardResponseDto({
      today,
      week,
      month,
      year,
      topSales: summarizeTopSales(salesRecords).map(toTopSalesDto),
      priceRange: summarizePriceRanges(salesRecords).map(toPriceRangeDto),
    });
  }
}

export const dashboardService = new DashboardService();
