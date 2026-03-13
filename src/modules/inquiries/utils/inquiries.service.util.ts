import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import type { UpdateInquiryReplyDto } from '../dto/update-inquiry-reply.dto';
import type { UpdateInquiryDto } from '../dto/update-inquiry.dto';
import type {
  InquiriesQuery,
  InquiryAnswerWithRelations,
  InquiryWithRelations,
  NormalizedInquiriesQuery,
} from '../types/inquiries.type';
import {
  DEFAULT_INQUIRIES_PAGE,
  DEFAULT_INQUIRIES_PAGE_SIZE,
} from './inquiries.util';

export function normalizeInquiriesQuery(
  query: InquiriesQuery,
): NormalizedInquiriesQuery {
  return {
    page: query.page && query.page > 0 ? query.page : DEFAULT_INQUIRIES_PAGE,
    pageSize:
      query.pageSize && query.pageSize > 0
        ? query.pageSize
        : DEFAULT_INQUIRIES_PAGE_SIZE,
    status: query.status,
  };
}

export function requireInquiry(
  inquiry: InquiryWithRelations | null,
  message = '요청한 리소스를 찾을 수 없습니다.',
): InquiryWithRelations {
  if (!inquiry) {
    throw new NotFoundError(message);
  }

  return inquiry;
}

export function requireReply(
  reply: InquiryAnswerWithRelations | null,
): InquiryAnswerWithRelations {
  if (!reply) {
    throw new NotFoundError('요청한 리소스를 찾을 수 없습니다.');
  }

  return reply;
}

export function ensureInquiryAccessible(
  userId: string,
  userType: 'BUYER' | 'SELLER',
  inquiry: InquiryWithRelations,
) {
  const isBuyerOwner = inquiry.buyerId === userId;
  const isSellerOwner = inquiry.product.store.sellerId === userId;

  if (userType === 'BUYER' && !isBuyerOwner) {
    throw new ForbiddenError('접근 권한이 없습니다.');
  }

  if (userType === 'SELLER' && !isSellerOwner) {
    throw new ForbiddenError('접근 권한이 없습니다.');
  }
}

export function ensureInquiryBuyerOwner(
  userId: string,
  inquiry: InquiryWithRelations,
) {
  if (inquiry.buyerId !== userId) {
    throw new ForbiddenError('접근 권한이 없습니다.');
  }
}

export function ensureInquirySellerOwner(
  userId: string,
  inquiry: InquiryWithRelations,
) {
  if (inquiry.product.store.sellerId !== userId) {
    throw new ForbiddenError('접근 권한이 없습니다.');
  }
}

export function ensureReplySellerOwner(
  userId: string,
  reply: InquiryAnswerWithRelations,
) {
  if (
    reply.inquiry.product.store.sellerId !== userId ||
    reply.sellerId !== userId
  ) {
    throw new ForbiddenError('접근 권한이 없습니다.');
  }
}

export function ensureReplyCreatable(inquiry: InquiryWithRelations) {
  if (inquiry.answer) {
    throw new BadRequestError();
  }
}

export function ensureReplyDeletable(inquiry: InquiryWithRelations) {
  if (!inquiry.answer) {
    throw new BadRequestError();
  }
}

export function ensureUpdateInquiryInput(data: UpdateInquiryDto) {
  if (
    data.title === undefined &&
    data.content === undefined &&
    data.isSecret === undefined
  ) {
    throw new BadRequestError();
  }
}

export function ensureUpdateReplyInput(data: UpdateInquiryReplyDto) {
  if (data.content === undefined) {
    throw new BadRequestError();
  }
}
