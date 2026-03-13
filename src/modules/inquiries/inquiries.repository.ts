import { InquiryStatus } from '@prisma/client';
import { prisma } from '../../lib/constants/prismaClient';
import {
  inquiryAnswerInclude,
  inquiryInclude,
} from './queries/inquiries.query';
import type {
  InquiriesPageResult,
  NormalizedInquiriesQuery,
  UpdateInquiryRecordInput,
  UpdateInquiryReplyRecordInput,
} from './types/inquiries.type';

export class InquiriesRepository {
  async findPageByUser(
    userId: string,
    userType: 'BUYER' | 'SELLER',
    query: NormalizedInquiriesQuery,
  ): Promise<InquiriesPageResult> {
    const where = {
      ...(userType === 'BUYER' ? { buyerId: userId } : {}),
      ...(userType === 'SELLER'
        ? {
            product: {
              store: {
                sellerId: userId,
              },
            },
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [inquiries, totalCount] = await prisma.$transaction([
      prisma.inquiry.findMany({
        where,
        include: inquiryInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.inquiry.count({
        where,
      }),
    ]);

    return {
      inquiries,
      totalCount,
    };
  }

  findById(inquiryId: string) {
    return prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: inquiryInclude,
    });
  }

  updateById(inquiryId: string, data: UpdateInquiryRecordInput) {
    return prisma.inquiry.update({
      where: { id: inquiryId },
      data,
      include: inquiryInclude,
    });
  }

  deleteById(inquiryId: string) {
    return prisma.inquiry.delete({
      where: { id: inquiryId },
      include: inquiryInclude,
    });
  }

  deleteReplyByInquiryId(inquiryId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.inquiryAnswer.delete({
        where: { inquiryId },
      });

      return tx.inquiry.update({
        where: { id: inquiryId },
        data: {
          status: InquiryStatus.WaitingAnswer,
        },
        include: inquiryInclude,
      });
    });
  }

  createReply(inquiryId: string, sellerId: string, content: string) {
    return prisma.$transaction(async (tx) => {
      await tx.inquiry.update({
        where: { id: inquiryId },
        data: {
          status: InquiryStatus.CompletedAnswer,
        },
      });

      return tx.inquiryAnswer.create({
        data: {
          inquiryId,
          sellerId,
          content,
        },
        include: inquiryAnswerInclude,
      });
    });
  }

  findReplyById(replyId: string) {
    return prisma.inquiryAnswer.findUnique({
      where: { id: replyId },
      include: inquiryAnswerInclude,
    });
  }

  updateReplyById(replyId: string, data: UpdateInquiryReplyRecordInput) {
    return prisma.inquiryAnswer.update({
      where: { id: replyId },
      data,
      include: inquiryAnswerInclude,
    });
  }
}

export const inquiriesRepository = new InquiriesRepository();
