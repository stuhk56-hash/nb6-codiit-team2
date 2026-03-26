export interface PaymentResponseDto {
  id: string;
  orderId: string;
  price: number;
  paymentMethod: string;
  paymentMethodLabel?: string;
  status: string;
  statusLabel?: string;
  cardNumber?: string;
  bankName?: string;
  phoneNumber?: string;
  transactionId?: string;
  order?: {
    id: string;
    buyerId: string;
    buyerName: string;
    phoneNumber: string;
    address: string;
    status: string;
    usedPoints: number;
    earnedPoints: number;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentPaginatedResponseDto {
  data: PaymentResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
