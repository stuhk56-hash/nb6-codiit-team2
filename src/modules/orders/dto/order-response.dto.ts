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
  status: string;
  createdAt: string;
  updatedAt: string;
  buyerId: string;
  items?: OrderItemDto[];
  payment?: PaymentDto | null;
  shipping?: ShippingDto | null;
}
