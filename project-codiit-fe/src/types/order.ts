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

export enum ShippingStatus {
  ReadyToShip = "ReadyToShip", // 배송준비
  InShipping = "InShipping", // 배송중
  Delivered = "Delivered", // 배송완료
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
  price: number;
  isReviewed?: boolean;
  product: {
    name: string;
    image: string;
    reviews: Array<{
      id: string;
      rating: number;
      content: string;
      createdAt: string;
    }>;
  };
  size: {
    size: {
      en: string;
      ko: string;
    };
  };
}

export interface Payment {
  id: string;
  price: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  orderId: string;
}

export interface Shipping {
  id: string;
  orderId: string;
  status: ShippingStatus;
  trackingNumber: string;
  carrier: string;
  readyToShipAt?: string;
  inShippingAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  usedPoints: number;
  earnedPoints: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  orderItems?: OrderItem[]; // 하위 호환성
  payment?: Payment;
  payments?: Payment; // 하위 호환성
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

export interface Shipping {
  id: string;
  orderId: string;
  status: ShippingStatus;
  trackingNumber: string;
  carrier: string;
  readyToShipAt?: string;
  inShippingAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  shippingHistories?: ShippingHistory[]; // ✅ 추가
}
