// ============================================
// 주문 관련 Enum (백엔드와 동기화)
// ============================================

export enum OrderStatus {
  WaitingPayment = "WaitingPayment",
  CompletedPayment = "CompletedPayment",
  Canceled = "Canceled",
}

export enum PaymentStatus {
  WaitingPayment = "WaitingPayment",
  CompletedPayment = "CompletedPayment",
  FailedPayment = "FailedPayment",
  CanceledPayment = "CanceledPayment",
}

export enum PaymentMethod {
  BankTransfer = "BANK_TRANSFER",
  CreditCard = "CREDIT_CARD",
  MobilePhone = "MOBILE_PHONE",
}

export enum ShippingStatus {
  ReadyToShip = "ReadyToShip",
  InShipping = "InShipping",
  Delivered = "Delivered",
}

// ============================================
// 주문 관련 Interface
// ============================================

export interface OrderItem {
  id: string;
  productId: string;
  sizeId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
  productImageUrl?: string;
  price?: number;
  isReviewed?: boolean;
  reviews?: Array<{
    // ✅ 추가
    id: string;
    rating: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    buyerId: string;
    productId: string;
    orderItemId: string | null;
  }>;
  product?: {
    name?: string;
    image?: string;
    reviews?: Array<{
      id: string;
      rating: number;
      content: string;
      createdAt: string;
    }>;
  };
  size?: {
    id?: number;
    name?: string;
    nameKo?: string;
    nameEn?: string;
    size?: {
      en?: string;
      ko?: string;
    };
  };
}

export interface Payment {
  id: string;
  price: number;
  status: PaymentStatus | string;
  paymentMethod?: PaymentMethod | string;
  createdAt: string;
  updatedAt: string;
  orderId: string;
}

export interface Shipping {
  id: string;
  orderId: string;
  status: ShippingStatus | string;
  trackingNumber?: string;
  carrier?: string;
  readyToShipAt?: string;
  inShippingAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  shippingHistories?: Array<{
    id: string;
    shippingId: string;
    status: string;
    description: string;
    location?: string;
    createdAt: string;
  }>;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  usedPoints?: number;
  earnedPoints?: number;
  status: OrderStatus | string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  payment?: Payment;
  shipping?: Shipping;
}

export interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderItemRequest {
  productId: string;
  sizeId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  name: string;
  phone: string;
  address: string;
  orderItems: OrderItemRequest[];
  usePoint: number;
}

export interface ShippingHistory {
  id: string;
  shippingId: string;
  status: string;
  description: string;
  location?: string;
  createdAt: string;
}

// ✅ 응답 타입 추가
export interface OrderResponseDto {
  id: string;
  buyerId: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  usedPoints: number;
  earnedPoints: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment: Payment;
  shipping: Shipping;
}
