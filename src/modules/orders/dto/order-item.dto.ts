export interface OrderItemDto {
  id: string;
  price: number;
  quantity: number;
  productId: string;
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
    id: number;
    size: {
      en: string;
      ko: string;
    };
  };
  isReviewed: boolean;
}
