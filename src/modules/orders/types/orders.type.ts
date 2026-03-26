import {
  Order,
  OrderItem,
  Payment,
  Shipping,
  Product,
  Size,
  Review,
} from '@prisma/client';

export interface ShippingWithRelations extends Shipping {}

export interface PaymentWithRelations extends Payment {}

export interface OrderItemWithRelations extends OrderItem {
  product: Product & {
    reviews: Review[];
  };
  size: Size;
  reviews: Review[];
}

export interface OrderWithRelations extends Order {
  items: OrderItemWithRelations[];
  payment: PaymentWithRelations | null;
  shipping: ShippingWithRelations | null;
}

// ✅ 실제 DB 반환 타입 (Prisma select 결과)
export type OrderItemSelectResult = {
  id: string;
  unitPrice: number;
  quantity: number;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    store: {
      id: string;
      sellerId: string;
      name: string;
      address: string;
      detailAddress: string;
      phoneNumber: string;
      content: string;
      imageUrl: string | null;
      imageKey: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    stocks: Array<{
      id: string;
      quantity: number;
      size: {
        id: number;
        name: string;
        nameEn: string;
        nameKo: string;
      };
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      content: string;
      createdAt: Date;
      updatedAt: Date;
      buyerId: string;
      productId: string;
      orderItemId: string | null;
    }>;
  };
  size: {
    id: number;
    name: string;
    nameEn: string;
    nameKo: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    buyerId: string;
    productId: string;
    orderItemId: string | null;
  }>;
};

export type PaymentSelectResult = {
  id: string;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  orderId: string;
};

export type ShippingSelectResult = {
  id: string;
  status: string;
  trackingNumber: string;
  carrier: string;
  readyToShipAt: Date | null;
  inShippingAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// ✅ Prisma select 결과 타입 (payment & shipping 추가)
export type OrderSelectResult = {
  id: string;
  buyerId: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  usedPoints: number;
  earnedPoints: number;
  status: string; // ✅ status 추가
  createdAt: Date;
  updatedAt: Date; // ✅ updatedAt 추가
  items: OrderItemSelectResult[];
  payment: PaymentSelectResult | null; // ✅ null 가능
  shipping: ShippingSelectResult | null; // ✅ shipping 추가
};
