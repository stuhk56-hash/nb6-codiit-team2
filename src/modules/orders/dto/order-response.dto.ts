import { OrderItemDto } from './order-item.dto';
import { PaymentDto } from './payment.dto';
import { ShippingDto } from './shipping.dto';

export interface OrderResponseDto {
  id: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  usedPoints: number;
  earnedPoints: number;
  status: string; // ✅ status 추가
  createdAt: string;
  orderItems: OrderItemDto[];
  payments: PaymentDto | null; // ✅ null 가능
  shipping: ShippingDto | null; // ✅ shipping 추가
}
