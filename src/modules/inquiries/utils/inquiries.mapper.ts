import type { DetailInquiryReplyDto } from '../dto/detail-inquiry-reply.dto';
import type { InquiryItemDto } from '../dto/inquiry-item.dto';
import type { InquiryListResponseDto } from '../dto/inquiry-list-response.dto';
import type { InquiryReplyResponseDto } from '../dto/inquiry-reply-response.dto';
import type { InquiryResponseDto } from '../dto/inquiry-response.dto';
import type {
  InquiryAnswerWithRelations,
  InquiryWithRelations,
} from '../types/inquiries.type';

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

function toDetailInquiryReplyDto(
  answer: InquiryWithRelations['answer'],
): DetailInquiryReplyDto | null {
  if (!answer) {
    return null;
  }

  return {
    id: answer.id,
    content: answer.content,
    createdAt: answer.createdAt.toISOString(),
    updatedAt: answer.updatedAt.toISOString(),
    user: answer.seller
      ? {
          id: answer.seller.id,
          name: answer.seller.name,
        }
      : null,
  };
}

export function toInquiryResponseDto(
  inquiry: InquiryWithRelations,
): InquiryResponseDto {
  return {
    id: inquiry.id,
    userId: inquiry.buyerId,
    productId: inquiry.productId,
    title: inquiry.title,
    content: inquiry.content,
    status: inquiry.status,
    isSecret: inquiry.isSecret,
    createdAt: inquiry.createdAt.toISOString(),
    updatedAt: inquiry.updatedAt.toISOString(),
    reply: toDetailInquiryReplyDto(inquiry.answer),
  };
}

export function toInquiryReplyResponseDto(
  reply: InquiryAnswerWithRelations,
): InquiryReplyResponseDto {
  return {
    id: reply.id,
    inquiryId: reply.inquiryId,
    userId: reply.sellerId ?? null,
    content: reply.content,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
  };
}

export function toInquiryItemDto(inquiry: InquiryWithRelations): InquiryItemDto {
  return {
    id: inquiry.id,
    title: inquiry.title,
    isSecret: inquiry.isSecret,
    status: inquiry.status,
    product: {
      id: inquiry.product.id,
      name: inquiry.product.name,
      image: toRequiredImage(inquiry.product.imageUrl),
      store: {
        id: inquiry.product.store.id,
        name: inquiry.product.store.name,
      },
    },
    user: {
      name: inquiry.buyer.name,
    },
    createdAt: inquiry.createdAt.toISOString(),
    content: inquiry.content,
  };
}

export function toInquiryListResponseDto(
  inquiries: InquiryWithRelations[],
  totalCount: number,
): InquiryListResponseDto {
  return {
    list: inquiries.map(toInquiryItemDto),
    totalCount,
  };
}
