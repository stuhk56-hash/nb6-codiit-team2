import { DetailProductResponseDto } from '../dto/detail-product-response.dto';
import { ProductInquiryListResponseDto } from '../dto/product-inquiry-list-response.dto';
import { ProductInquiryResponseDto } from '../dto/product-inquiry-response.dto';
import { ProductDto } from '../dto/product.dto';
import { ProductListDto } from '../dto/product-list.dto';
import { ProductListResponseDto } from '../dto/product-list-response.dto';
import { StockDto } from '../dto/stock.dto';
import {
  ProductInquiryWithAnswer,
  ProductWithRelations,
} from '../types/products.type';
import {
  calculateAverageRating,
  calculateDiscountPrice,
} from './products.util';

function toRequiredImage(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return '/images/Mask-group.svg';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '/images/Mask-group.svg';
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  return '/images/Mask-group.svg';
}

function toRequiredText(value: string | null | undefined) {
  return value ?? '';
}

function toNullableIsoString(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function toRequiredIsoString(value: Date | null | undefined, fallback: Date) {
  return (value ?? fallback).toISOString();
}

function toRequiredNumber(value: number | null | undefined) {
  return value ?? 0;
}

export function toStockDto(product: ProductWithRelations): StockDto[] {
  return product.stocks.map((stock) => ({
    id: stock.id,
    productId: stock.productId,
    sizeId: stock.sizeId,
    quantity: stock.quantity,
    size: {
      id: stock.size.id,
      size: {
        en: stock.size.nameEn,
        ko: stock.size.nameKo,
      },
      name: stock.size.name,
    },
  }));
}

export function toProductDto(product: ProductWithRelations): ProductDto {
  return {
    id: product.id,
    storeId: product.storeId,
    name: product.name,
    price: product.price,
    image: toRequiredImage(product.imageUrl),
    discountRate: toRequiredNumber(product.discountRate),
    discountStartTime: toRequiredIsoString(
      product.discountStartTime,
      product.createdAt,
    ),
    discountEndTime: toRequiredIsoString(
      product.discountEndTime,
      product.updatedAt,
    ),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function toProductListDto(
  product: ProductWithRelations,
): ProductListDto {
  return {
    id: product.id,
    storeId: product.storeId,
    storeName: product.store.name,
    name: product.name,
    image: toRequiredImage(product.imageUrl),
    price: product.price,
    discountPrice: calculateDiscountPrice(
      product.price,
      product.discountRate,
      product.discountStartTime,
      product.discountEndTime,
    ),
    discountRate: toRequiredNumber(product.discountRate),
    discountStartTime: toRequiredIsoString(
      product.discountStartTime,
      product.createdAt,
    ),
    discountEndTime: toRequiredIsoString(
      product.discountEndTime,
      product.updatedAt,
    ),
    reviewsCount: product.reviews.length,
    reviewsRating: calculateAverageRating(product.reviews),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    sales: product.orderItems.reduce(
      (sum, orderItem) => sum + orderItem.quantity,
      0,
    ),
    isSoldOut: product.isSoldOut,
  };
}

export function toProductListResponseDto(
  list: ProductWithRelations[],
): ProductListResponseDto {
  return {
    list: list.map(toProductListDto),
    totalCount: list.length,
  };
}

export function toDetailProductResponseDto(
  product: ProductWithRelations,
): DetailProductResponseDto {
  const rate1Length = product.reviews.filter(
    (review) => review.rating === 1,
  ).length;
  const rate2Length = product.reviews.filter(
    (review) => review.rating === 2,
  ).length;
  const rate3Length = product.reviews.filter(
    (review) => review.rating === 3,
  ).length;
  const rate4Length = product.reviews.filter(
    (review) => review.rating === 4,
  ).length;
  const rate5Length = product.reviews.filter(
    (review) => review.rating === 5,
  ).length;
  const sumScore = calculateAverageRating(product.reviews);

  return {
    id: product.id,
    name: product.name,
    image: toRequiredImage(product.imageUrl),
    content: toRequiredText(product.content),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    reviewsRating: sumScore,
    storeId: product.storeId,
    storeName: product.store.name,
    price: product.price,
    discountPrice: calculateDiscountPrice(
      product.price,
      product.discountRate,
      product.discountStartTime,
      product.discountEndTime,
    ),
    discountRate: toRequiredNumber(product.discountRate),
    discountStartTime: toNullableIsoString(product.discountStartTime),
    discountEndTime: toNullableIsoString(product.discountEndTime),
    reviewsCount: product.reviews.length,
    reviews: {
      rate1Length,
      rate2Length,
      rate3Length,
      rate4Length,
      rate5Length,
      sumScore,
    },
    inquiries: product.inquiries.map((inquiry) =>
      toProductInquiryListItem(inquiry),
    ),
    categoryId: product.categoryId,
    category: {
      name: product.category.name,
      id: product.category.id,
    },
    stocks: toStockDto(product),
    isSoldOut: product.isSoldOut,
  };
}

export function toProductInquiryListItem(
  inquiry: ProductInquiryWithAnswer,
): ProductInquiryResponseDto {
  return {
    id: inquiry.id,
    productId: inquiry.productId,
    userId: inquiry.buyerId,
    title: inquiry.title,
    content: inquiry.content,
    isSecret: inquiry.isSecret,
    status: inquiry.status,
    createdAt: inquiry.createdAt.toISOString(),
    updatedAt: inquiry.updatedAt.toISOString(),
    user: {
      id: inquiry.buyer.id,
      name: inquiry.buyer.name,
    },
    reply: inquiry.answer
      ? {
          id: inquiry.answer.id,
          content: inquiry.answer.content,
          createdAt: inquiry.answer.createdAt.toISOString(),
          updatedAt: inquiry.answer.updatedAt.toISOString(),
          user: {
            id: inquiry.answer.sellerId,
            name: '판매자',
          },
        }
      : null,
  };
}

export function toProductInquiryResponseDto(
  inquiry: ProductInquiryWithAnswer,
): ProductInquiryResponseDto {
  return toProductInquiryListItem(inquiry);
}

export function toProductInquiryListResponseDto(
  list: ProductInquiryWithAnswer[],
): ProductInquiryListResponseDto {
  return {
    list: list.map((inquiry) => toProductInquiryListItem(inquiry)),
    totalCount: list.length,
  };
}
