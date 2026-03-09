import { InquiryForbiddenError, InquiryNotFoundError, InquiryUnauthorizedError, InquiryValidationError } from '../inquiries.errors';
import type { AuthUser, InquiryRole } from '../types/inquiries.type';

export function requireAuth(user?: AuthUser): asserts user is AuthUser {
  if (!user) {
    throw new InquiryUnauthorizedError('로그인이 필요합니다.');
  }
}

export function requireRole(user: AuthUser, allowedRoles: InquiryRole[]) {
  const role = getUserRole(user);

  if (!allowedRoles.includes(role)) {
    throw new InquiryForbiddenError('허용되지 않은 사용자 유형입니다.');
  }
}

export function getUserRole(user: AuthUser): InquiryRole {
  if (!user.role) {
    throw new InquiryUnauthorizedError('사용자 권한 정보를 확인할 수 없습니다.');
  }

  return user.role;
}

export function assertInquiryExists<T>(inquiry: T | null, notFoundMessage: string): asserts inquiry is T {
  if (!inquiry) {
    throw new InquiryNotFoundError(notFoundMessage);
  }
}

export function assertReplyExists<T>(reply: T | null, notFoundMessage: string): asserts reply is T {
  if (!reply) {
    throw new InquiryNotFoundError(notFoundMessage);
  }
}

export function assertCanReadInquiry(user: AuthUser, inquiry: any) {
  const role = getUserRole(user);
  const requesterId = String(user.id);
  const isBuyerOwner = inquiry.buyerId === requesterId;
  const isSellerOwner = inquiry.product.store.sellerId === requesterId;
  const isAdmin = role === 'ADMIN';

  if (!isBuyerOwner && !isSellerOwner && !isAdmin) {
    throw new InquiryForbiddenError('문의를 조회할 권한이 없습니다.');
  }
}

export function assertCanManageInquiry(user: AuthUser, inquiry: any, actionName: '수정' | '삭제') {
  const role = getUserRole(user);
  const requesterId = String(user.id);

  if (role !== 'ADMIN' && inquiry.buyerId !== requesterId) {
    throw new InquiryForbiddenError(`본인이 작성한 문의만 ${actionName}할 수 있습니다.`);
  }
}

export function assertCanCreateReply(user: AuthUser, inquiry: any) {
  const role = getUserRole(user);
  const requesterId = String(user.id);

  if (role !== 'ADMIN' && inquiry.product.store.sellerId !== requesterId) {
    throw new InquiryForbiddenError('해당 상품의 판매자만 답변할 수 있습니다.');
  }

  if (inquiry.answer) {
    throw new InquiryValidationError('이미 답변이 등록된 문의입니다.');
  }
}

export function assertCanManageReply(user: AuthUser, reply: any, actionName: '수정' | '삭제') {
  const role = getUserRole(user);
  const requesterId = String(user.id);
  const ownerSellerId = reply.inquiry.product.store.sellerId;

  if (role !== 'ADMIN' && reply.sellerId !== requesterId && ownerSellerId !== requesterId) {
    throw new InquiryForbiddenError(`해당 답변을 ${actionName}할 권한이 없습니다.`);
  }
}
