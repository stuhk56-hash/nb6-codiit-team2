export interface PaymentResponse {
  id: string;
  orderId: string;
  price: number;
  paymentMethod: "CREDIT_CARD" | "BANK_TRANSFER" | "MOBILE_PHONE";
  paymentMethodLabel: string;
  status: "WaitingPayment" | "CompletedPayment" | "FailedPayment" | "CanceledPayment";
  statusLabel: string;
  cardNumber?: string;
  bankName?: string;
  phoneNumber?: string;
  transactionId?: string;
  order: {
    id: string;
    buyerId: string;
    buyerName: string;
    phoneNumber: string;
    address: string;
    status: string;
    usedPoints: number;
    earnedPoints: number;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  orderId: string;
  price: number;
  paymentMethod: "CREDIT_CARD" | "BANK_TRANSFER" | "MOBILE_PHONE";
  cardNumber?: string;
  bankName?: string;
  phoneNumber?: string;
}
