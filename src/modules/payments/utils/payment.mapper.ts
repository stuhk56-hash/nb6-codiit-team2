import { PaymentResponseDto } from '../dto/payment-response.dto';
import { getPaymentMethodLabel, getPaymentStatusLabel } from './payment.util';

export function toPaymentDto(payment: any): PaymentResponseDto {
  return {
    id: payment.id,
    orderId: payment.orderId,
    price: payment.price,
    paymentMethod: payment.paymentMethod,
    paymentMethodLabel: getPaymentMethodLabel(payment.paymentMethod),
    status: payment.status,
    statusLabel: getPaymentStatusLabel(payment.status),
    cardNumber: payment.cardNumber || undefined,
    bankName: payment.bankName || undefined,
    phoneNumber: payment.phoneNumber || undefined,
    transactionId: payment.transactionId || undefined,
    order: payment.order
      ? {
          id: payment.order.id,
          buyerId: payment.order.buyerId,
          buyerName: payment.order.buyerName,
          phoneNumber: payment.order.phoneNumber,
          address: payment.order.address,
          status: payment.order.status,
          usedPoints: payment.order.usedPoints,
          earnedPoints: payment.order.earnedPoints,
          createdAt: payment.order.createdAt,
        }
      : undefined,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}
