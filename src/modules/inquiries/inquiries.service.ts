import type { AuthUser } from '../../types/auth-request.type';
import type { CreateInquiryReplyDto } from './dto/create-inquiry-reply.dto';
import type { InquiryListResponseDto } from './dto/inquiry-list-response.dto';
import type { InquiryReplyResponseDto } from './dto/inquiry-reply-response.dto';
import type { InquiryResponseDto } from './dto/inquiry-response.dto';
import type { UpdateInquiryReplyDto } from './dto/update-inquiry-reply.dto';
import type { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { inquiriesRepository } from './inquiries.repository';
import type { InquiriesQuery } from './types/inquiries.type';
import {
  toInquiryListResponseDto,
  toInquiryReplyResponseDto,
  toInquiryResponseDto,
} from './utils/inquiries.mapper';
import {
  ensureInquiryAccessible,
  ensureInquiryBuyerOwner,
  ensureInquirySellerOwner,
  ensureReplyCreatable,
  ensureReplyDeletable,
  ensureReplySellerOwner,
  ensureUpdateInquiryInput,
  ensureUpdateReplyInput,
  normalizeInquiriesQuery,
  requireInquiry,
  requireReply,
} from './utils/inquiries.service.util';

export class InquiriesService {
  async findMyInquiries(
    user: AuthUser,
    query: InquiriesQuery,
  ): Promise<InquiryListResponseDto> {
    const normalized = normalizeInquiriesQuery(query);
    const { inquiries, totalCount } = await inquiriesRepository.findPageByUser(
      user.id,
      user.type,
      normalized,
    );

    return await toInquiryListResponseDto(inquiries, totalCount);
  }

  async findOneInquiry(
    user: AuthUser,
    inquiryId: string,
  ): Promise<InquiryResponseDto> {
    const inquiry = requireInquiry(
      await inquiriesRepository.findById(inquiryId),
      '문의가 존재하지 않습니다.',
    );
    ensureInquiryAccessible(user.id, user.type, inquiry);

    return toInquiryResponseDto(inquiry);
  }

  async updateInquiry(
    userId: string,
    inquiryId: string,
    data: UpdateInquiryDto,
  ): Promise<InquiryResponseDto> {
    ensureUpdateInquiryInput(data);

    const inquiry = requireInquiry(
      await inquiriesRepository.findById(inquiryId),
    );
    ensureInquiryBuyerOwner(userId, inquiry);

    const updated = await inquiriesRepository.updateById(inquiryId, data);
    return toInquiryResponseDto(updated);
  }

  async deleteInquiry(
    user: AuthUser,
    inquiryId: string,
  ): Promise<InquiryResponseDto> {
    const inquiry = requireInquiry(
      await inquiriesRepository.findById(inquiryId),
    );
    if (user.type === 'SELLER') {
      ensureInquirySellerOwner(user.id, inquiry);
      ensureReplyDeletable(inquiry);

      const updated =
        await inquiriesRepository.deleteReplyByInquiryId(inquiryId);
      return toInquiryResponseDto(updated);
    }

    ensureInquiryBuyerOwner(user.id, inquiry);

    const deleted = await inquiriesRepository.deleteById(inquiryId);
    return toInquiryResponseDto(deleted);
  }

  async replyCreate(
    userId: string,
    inquiryId: string,
    data: CreateInquiryReplyDto,
  ): Promise<InquiryReplyResponseDto> {
    const inquiry = requireInquiry(
      await inquiriesRepository.findById(inquiryId),
    );
    ensureInquirySellerOwner(userId, inquiry);
    ensureReplyCreatable(inquiry);

    const created = await inquiriesRepository.createReply(
      inquiryId,
      userId,
      data.content,
    );

    return toInquiryReplyResponseDto(created);
  }

  async replyUpdate(
    userId: string,
    replyId: string,
    data: UpdateInquiryReplyDto,
  ): Promise<InquiryReplyResponseDto> {
    ensureUpdateReplyInput(data);

    const reply = requireReply(
      await inquiriesRepository.findReplyById(replyId),
    );
    ensureReplySellerOwner(userId, reply);

    const updated = await inquiriesRepository.updateReplyById(replyId, data);
    return toInquiryReplyResponseDto(updated);
  }
}

export const inquiriesService = new InquiriesService();
