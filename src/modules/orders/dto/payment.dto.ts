export interface PaymentDto {
  id: string;
  price: number;
  status: string;
  paymentMethod?: string;
  cardNumber?: string;
  bankName?: string;
  phoneNumber?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  orderId: string;
}
