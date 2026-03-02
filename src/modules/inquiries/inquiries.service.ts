import { InquiryStatus } from '@prisma/client';
import {
  InquiryForbiddenError,
  InquiryNotFoundError,
  InquiryUnauthorizedError,
  InquiryValidationError,
} from './inquiries.errors';
import { INQUIRY_STATUS_API_to_DB } from '../../utils/enum-mapper';
import type { CreateInquiryReplyDto } from './dto/create-inquiry-reply.dto';
import type { CreateInquiryDto } from './dto/create-inquiry.dto';
import type { InquiriesListQueryDto } from './dto/inquiries-list.dto';
import type { UpdateInquiryReplyDto } from './dto/update-inquiry-reply.dto';
import type { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { InquiryEntity } from './entities/inquiry.entity';
import { ReplyEntity } from './entities/reply.entity';
import type { InquiriesRepository } from './inquiries.repository';

type AuthUser = {
  id: string | number;
  role?: 'BUYER' | 'SELLER' | 'ADMIN';
};

const normalizeText = (value: string | undefined, fieldName: string) => {
  const normalized = (value ?? '').trim();
  if (!normalized) throw new InquiryValidationError(`${fieldName}은(는) 비워둘 수 없습니다.`);
  return normalized;
};

export class InquiriesService {
  constructor(private readonly inquiriesRepository: InquiriesRepository) {}

  async createInquiry(user: AuthUser | undefined, dto: CreateInquiryDto) {
    this.ensureAuthenticated(user);
    this.ensureRole(user, ['BUYER', 'ADMIN']);

    const title = normalizeText(dto.title, 'title');
    const content = normalizeText(dto.content, 'content');

    const created = await this.inquiriesRepository.createInquiry({
      productId: dto.productId,
      buyerId: String(user.id),
      title,
      content,
      isSecret: dto.isSecret ?? false,
    });

    return InquiryEntity.toDetail(created as any);
  }

  async getMyInquiries(user: AuthUser | undefined, query: InquiriesListQueryDto) {
    this.ensureAuthenticated(user);
    const role = this.getRole(user);

    const page = this.parsePositiveInt(query.page, 1, 'page');
    const pageSize = this.parsePositiveInt(query.pageSize, 16, 'pageSize');
    const status = this.parseStatus(query.status);

    const result = await this.inquiriesRepository.findManyMyInquiries({
      userId: String(user.id),
      role,
      page,
      pageSize,
      status,
    });

    return {
      list: result.list.map((item) => InquiryEntity.toListItem(item as any)),
      totalCount: result.totalCount,
    };
  }

  async getInquiryDetail(user: AuthUser | undefined, inquiryId: string) {
    this.ensureAuthenticated(user);
    const inquiry = await this.inquiriesRepository.findInquiryById(inquiryId);
    if (!inquiry) throw new InquiryNotFoundError('문의가 존재하지 않습니다.');

    this.assertCanReadInquiry(user, inquiry);
    return InquiryEntity.toDetail(inquiry as any);
  }

  async updateInquiry(user: AuthUser | undefined, inquiryId: string, dto: UpdateInquiryDto) {
    this.ensureAuthenticated(user);
    const inquiry = await this.inquiriesRepository.findInquiryById(inquiryId);
    if (!inquiry) throw new InquiryNotFoundError('문의가 존재하지 않습니다.');

    const role = this.getRole(user);
    const userId = String(user.id);
    if (role !== 'ADMIN' && inquiry.buyerId !== userId) {
      throw new InquiryForbiddenError('본인이 작성한 문의만 수정할 수 있습니다.');
    }
    if (inquiry.status === InquiryStatus.CompletedAnswer) {
      throw new InquiryValidationError('답변 완료된 문의는 수정할 수 없습니다.');
    }

    const payload: { title?: string; content?: string; isSecret?: boolean } = {};
    if (dto.title !== undefined) payload.title = normalizeText(dto.title, 'title');
    if (dto.content !== undefined) payload.content = normalizeText(dto.content, 'content');
    if (dto.isSecret !== undefined) payload.isSecret = dto.isSecret;

    if (Object.keys(payload).length === 0) {
      throw new InquiryValidationError('수정할 항목이 없습니다.');
    }

    const updated = await this.inquiriesRepository.updateInquiry(inquiryId, payload);
    return InquiryEntity.toDetail(updated as any);
  }

  async deleteInquiry(user: AuthUser | undefined, inquiryId: string) {
    this.ensureAuthenticated(user);
    const inquiry = await this.inquiriesRepository.findInquiryById(inquiryId);
    if (!inquiry) throw new InquiryNotFoundError('문의가 존재하지 않습니다.');

    const role = this.getRole(user);
    const userId = String(user.id);
    if (role !== 'ADMIN' && inquiry.buyerId !== userId) {
      throw new InquiryForbiddenError('본인이 작성한 문의만 삭제할 수 있습니다.');
    }

    const deleted = await this.inquiriesRepository.deleteInquiry(inquiryId);
    return InquiryEntity.toDetail(deleted as any);
  }

  async createReply(user: AuthUser | undefined, inquiryId: string, dto: CreateInquiryReplyDto) {
    this.ensureAuthenticated(user);
    this.ensureRole(user, ['SELLER', 'ADMIN']);

    const inquiry = await this.inquiriesRepository.findInquiryById(inquiryId);
    if (!inquiry) throw new InquiryNotFoundError('문의가 존재하지 않습니다.');

    const role = this.getRole(user);
    const userId = String(user.id);
    if (role !== 'ADMIN' && inquiry.product.store.sellerId !== userId) {
      throw new InquiryForbiddenError('해당 상품의 판매자만 답변할 수 있습니다.');
    }
    if (inquiry.answer) {
      throw new InquiryValidationError('이미 답변이 등록된 문의입니다.');
    }

    const content = normalizeText(dto.content, 'content');
    const reply = await this.inquiriesRepository.createReply(inquiryId, userId, content);
    return ReplyEntity.fromReply(reply as any);
  }

  async updateReply(user: AuthUser | undefined, replyId: string, dto: UpdateInquiryReplyDto) {
    this.ensureAuthenticated(user);
    this.ensureRole(user, ['SELLER', 'ADMIN']);

    const reply = await this.inquiriesRepository.findReplyById(replyId);
    if (!reply) throw new InquiryNotFoundError('답변이 존재하지 않습니다.');

    const role = this.getRole(user);
    const userId = String(user.id);
    const ownerSellerId = reply.inquiry.product.store.sellerId;
    if (role !== 'ADMIN' && reply.sellerId !== userId && ownerSellerId !== userId) {
      throw new InquiryForbiddenError('해당 답변을 수정할 권한이 없습니다.');
    }

    const content = normalizeText(dto.content, 'content');
    const updated = await this.inquiriesRepository.updateReply(replyId, content);
    return ReplyEntity.fromReply(updated as any);
  }

  async deleteReply(user: AuthUser | undefined, replyId: string) {
    this.ensureAuthenticated(user);
    this.ensureRole(user, ['SELLER', 'ADMIN']);

    const reply = await this.inquiriesRepository.findReplyById(replyId);
    if (!reply) throw new InquiryNotFoundError('답변이 존재하지 않습니다.');

    const role = this.getRole(user);
    const userId = String(user.id);
    const ownerSellerId = reply.inquiry.product.store.sellerId;
    if (role !== 'ADMIN' && reply.sellerId !== userId && ownerSellerId !== userId) {
      throw new InquiryForbiddenError('해당 답변을 삭제할 권한이 없습니다.');
    }

    const deleted = await this.inquiriesRepository.deleteReply(replyId);
    return ReplyEntity.fromReply(deleted as any);
  }

  private parsePositiveInt(value: string | undefined, fallback: number, field: string) {
    if (value === undefined || value === '') return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new InquiryValidationError(`${field}는 1 이상의 정수여야 합니다.`);
    }
    return parsed;
  }

  private parseStatus(value?: string): InquiryStatus | undefined {
    if (!value) return undefined;
    if (Object.values(InquiryStatus).includes(value as InquiryStatus)) {
      return value as InquiryStatus;
    }

    const key = value as keyof typeof INQUIRY_STATUS_API_to_DB;
    if (key in INQUIRY_STATUS_API_to_DB) return INQUIRY_STATUS_API_to_DB[key];

    throw new InquiryValidationError('status 값이 올바르지 않습니다.');
  }

  private ensureAuthenticated(user?: AuthUser): asserts user is AuthUser {
    if (!user) throw new InquiryUnauthorizedError('로그인이 필요합니다.');
  }

  private getRole(user: AuthUser): 'BUYER' | 'SELLER' | 'ADMIN' {
    if (!user.role) throw new InquiryUnauthorizedError('사용자 권한 정보를 확인할 수 없습니다.');
    return user.role;
  }

  private ensureRole(user: AuthUser, roles: Array<'BUYER' | 'SELLER' | 'ADMIN'>) {
    if (!roles.includes(this.getRole(user))) {
      throw new InquiryForbiddenError('허용되지 않은 사용자 유형입니다.');
    }
  }

  private assertCanReadInquiry(user: AuthUser, inquiry: any) {
    const userId = String(user.id);
    const role = this.getRole(user);
    const isBuyerOwner = inquiry.buyerId === userId;
    const isSellerOwner = inquiry.product.store.sellerId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isBuyerOwner && !isSellerOwner && !isAdmin) {
      throw new InquiryForbiddenError('문의를 조회할 권한이 없습니다.');
    }
  }
}
