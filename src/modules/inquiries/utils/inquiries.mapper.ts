import type { DetailInquiryReplyDto } from '../dto/detail-inquiry-reply.dto';
import type { InquiryItemDto } from '../dto/inquiry-item.dto';
import type { InquiryListResponseDto } from '../dto/inquiry-list-response.dto';
import type { InquiryReplyResponseDto } from '../dto/inquiry-reply-response.dto';
import type { InquiryResponseDto } from '../dto/inquiry-response.dto';
import type {
  InquiryAnswerWithRelations,
  InquiryWithRelations,
} from '../types/inquiries.type';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';

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

export async function toInquiryItemDto(
  inquiry: InquiryWithRelations,
): Promise<InquiryItemDto> {
  return {
    id: inquiry.id,
    title: inquiry.title,
    isSecret: inquiry.isSecret,
    status: inquiry.status,
    product: {
      id: inquiry.product.id,
      name: inquiry.product.name,
      image: await resolveS3ImageUrl(
        inquiry.product.imageUrl,
        inquiry.product.imageKey,
        '/images/Mask-group.svg',
      ),
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

export async function toInquiryListResponseDto(
  inquiries: InquiryWithRelations[],
  totalCount: number,
): Promise<InquiryListResponseDto> {
  return {
    list: await Promise.all(inquiries.map(toInquiryItemDto)),
    totalCount,
  };
}
