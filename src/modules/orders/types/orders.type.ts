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

export type OrderSelectResult = {
  id: string;
  buyerId: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  usedPoints: number;
  earnedPoints: number;
  createdAt: Date;
  items: OrderItemSelectResult[];
  payment: PaymentSelectResult;
};

//Mapper에서 사용할 타입들
export type OrderWithRelations = OrderSelectResult;

export type OrderItemWithRelations = OrderItemSelectResult;

export type PaymentWithRelations = PaymentSelectResult;
