export function calculateAverageRating(reviews: Array<{ rating: number }>) {
  if (!reviews.length) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1)); //toFixed(1)은 소수점 첫째 자리까지 반올림해서 문자열로 반환
}

export function isSoldOutByStocks(stocks: Array<{ quantity: number }>) {
  return stocks.some((stock) => stock.quantity <= 0);
}

export function isDiscountActive(
  discountRate: number | null | undefined,
  discountStartTime: Date | null | undefined,
  discountEndTime: Date | null | undefined,
  now = new Date(),
) {
  const rate = discountRate ?? 0;
  if (!rate) {
    return false;
  }

  if (!discountStartTime || !discountEndTime) {
    return false;
  }

  return discountStartTime <= now && discountEndTime >= now;
}

export function calculateDiscountPrice(
  price: number,
  discountRate: number | null | undefined,
  discountStartTime: Date | null | undefined,
  discountEndTime: Date | null | undefined,
) {
  if (!isDiscountActive(discountRate, discountStartTime, discountEndTime)) {
    return price;
  }

  const rate = discountRate ?? 0;
  return Math.floor(price - price * (rate / 100));
}
