import { OrderItemDto } from './order-item.dto';
import { PaymentDto } from './payment.dto';

export interface OrderResponseDto {
  id: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  usedPoints: number;
  earnedPoints: number;
  createdAt: string;
  orderItems: OrderItemDto[];
  payments: PaymentDto;
}
