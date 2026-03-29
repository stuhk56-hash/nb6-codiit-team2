export interface CreatePaymentDto {
  orderId: string;
  price: number;
  paymentMethod: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOBILE_PHONE';
  cardNumber?: string;
  bankName?: string;
  phoneNumber?: string;
}

export interface UpdatePaymentDto {
  paymentMethod?: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOBILE_PHONE';
  cardNumber?: string;
  bankName?: string;
  phoneNumber?: string;
}
