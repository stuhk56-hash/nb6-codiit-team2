export type ReviewDetailResponseDto = {
  reviewId: string;
  productName: string;
  size: {
    en: string;
    ko: string;
  } | null;
  price: number | null;
  quantity: number | null;
  rating: number;
  content: string;
  reviewer: string;
  reviewCreatedAt: string;
  purchasedAt: string | null;
};
