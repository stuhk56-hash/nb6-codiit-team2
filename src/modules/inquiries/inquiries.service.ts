import { InquiryStatus } from '@prisma/client';
import { InquiryValidationError } from './inquiries.errors';
import type { CreateInquiryReplyDto } from './dto/create-inquiry-reply.dto';
import type { CreateInquiryDto } from './dto/create-inquiry.dto';
import type { InquiriesListQueryDto } from './dto/inquiries-list.dto';
import type { UpdateInquiryReplyDto } from './dto/update-inquiry-reply.dto';
import type { UpdateInquiryDto } from './dto/update-inquiry.dto';
import type { InquiriesRepository } from './inquiries.repository';
import type { AuthUser } from './types/inquiries.type';
import {
  toInquiryDetail,
  toInquiryListItem,
  toReplyResponse,
} from './utils/inquiries.mapper';
import {
  assertCanCreateReply,
  assertCanManageInquiry,
  assertCanManageReply,
  assertCanReadInquiry,
  assertInquiryExists,
  assertReplyExists,
  getUserRole,
  requireAuth,
  requireRole,
} from './utils/inquiries.service.util';
import {
  normalizeRequiredText,
  parseInquiryStatus,
  parsePositiveInteger,
} from './utils/inquiries.util';

export class InquiriesService {
  constructor(private readonly inquiriesRepository: InquiriesRepository) {}

  async createInquiry(user: AuthUser | undefined, dto: CreateInquiryDto) {
    requireAuth(user);
    requireRole(user, ['BUYER', 'ADMIN']);

    const createdInquiry = await this.inquiriesRepository.createInquiry({
      productId: dto.productId,
      buyerId: String(user.id),
      title: normalizeRequiredText(dto.title, 'title'),
      content: normalizeRequiredText(dto.content, 'content'),
      isSecret: dto.isSecret ?? false,
    });

    return toInquiryDetail(createdInquiry);
  }

  async getMyInquiries(user: AuthUser | undefined, query: InquiriesListQueryDto) {
    requireAuth(user);

    const result = await this.inquiriesRepository.findManyMyInquiries({
      userId: String(user.id),
      role: getUserRole(user),
      page: parsePositiveInteger(query.page, 1, 'page'),
      pageSize: parsePositiveInteger(query.pageSize, 16, 'pageSize'),
      status: parseInquiryStatus(query.status),
    });

    return {
      list: result.list.map(toInquiryListItem),
      totalCount: result.totalCount,
    };
  }

  async getInquiryDetail(user: AuthUser | undefined, inquiryId: string) {
    requireAuth(user);

    const inquiry = await this.inquiriesRepository.findInquiryById(inquiryId);
    assertInquiryExists(inquiry, '문의가 존재하지 않습니다.');

    assertCanReadInquiry(user, inquiry);
    return toInquiryDetail(inquiry);
  }

  async updateInquiry(user: AuthUser | undefined, inquiryId: string, dto: UpdateInquiryDto) {
    requireAuth(user);

    const inquiry = await this.inquiriesRepository.findInquiryById(inquiryId);
    assertInquiryExists(inquiry, '문의가 존재하지 않습니다.');

    assertCanManageInquiry(user, inquiry, '수정');
    assertInquiryEditable(inquiry.status);

    const payload = buildInquiryUpdatePayload(dto);
    const updatedInquiry = await this.inquiriesRepository.updateInquiry(inquiryId, payload);

    return toInquiryDetail(updatedInquiry);
  }

  async deleteInquiry(user: AuthUser | undefined, inquiryId: string) {
    requireAuth(user);

    const inquiry = await this.inquiriesRepository.findInquiryById(inquiryId);
    assertInquiryExists(inquiry, '문의가 존재하지 않습니다.');

    assertCanManageInquiry(user, inquiry, '삭제');

    const deletedInquiry = await this.inquiriesRepository.deleteInquiry(inquiryId);
    return toInquiryDetail(deletedInquiry);
  }

  async createReply(
    user: AuthUser | undefined,
    inquiryId: string,
    dto: CreateInquiryReplyDto,
  ) {
    requireAuth(user);
    requireRole(user, ['SELLER', 'ADMIN']);

    const inquiry = await this.inquiriesRepository.findInquiryById(inquiryId);
    assertInquiryExists(inquiry, '문의가 존재하지 않습니다.');
    assertCanCreateReply(user, inquiry);

    const createdReply = await this.inquiriesRepository.createReply(
      inquiryId,
      String(user.id),
      normalizeRequiredText(dto.content, 'content'),
    );

    return toReplyResponse(createdReply);
  }

  async updateReply(user: AuthUser | undefined, replyId: string, dto: UpdateInquiryReplyDto) {
    requireAuth(user);
    requireRole(user, ['SELLER', 'ADMIN']);

    const reply = await this.inquiriesRepository.findReplyById(replyId);
    assertReplyExists(reply, '답변이 존재하지 않습니다.');

    assertCanManageReply(user, reply, '수정');

    const updatedReply = await this.inquiriesRepository.updateReply(
      replyId,
      normalizeRequiredText(dto.content, 'content'),
    );

    return toReplyResponse(updatedReply);
  }

  async deleteReply(user: AuthUser | undefined, replyId: string) {
    requireAuth(user);
    requireRole(user, ['SELLER', 'ADMIN']);

    const reply = await this.inquiriesRepository.findReplyById(replyId);
    assertReplyExists(reply, '답변이 존재하지 않습니다.');

    assertCanManageReply(user, reply, '삭제');

    const deletedReply = await this.inquiriesRepository.deleteReply(replyId);
    return toReplyResponse(deletedReply);
  }
}

function assertInquiryEditable(status: InquiryStatus) {
  if (status === InquiryStatus.CompletedAnswer) {
    throw new InquiryValidationError('답변 완료된 문의는 수정할 수 없습니다.');
  }
}

function buildInquiryUpdatePayload(dto: UpdateInquiryDto) {
  const payload: { title?: string; content?: string; isSecret?: boolean } = {};

  if (dto.title !== undefined) {
    payload.title = normalizeRequiredText(dto.title, 'title');
  }

  if (dto.content !== undefined) {
    payload.content = normalizeRequiredText(dto.content, 'content');
  }

  if (dto.isSecret !== undefined) {
    payload.isSecret = dto.isSecret;
  }

  if (Object.keys(payload).length === 0) {
    throw new InquiryValidationError('수정할 항목이 없습니다.');
  }

  return payload;
}
