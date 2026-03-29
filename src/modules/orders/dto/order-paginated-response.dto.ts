import { OrderResponseDto } from './order-response.dto';

export interface OrderPaginatedResponseDto {
  data: OrderResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
