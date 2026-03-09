import { InquiryStatus, Prisma } from '@prisma/client';
import prisma from '../../configs/prisma';
import type { InquiriesListFilter } from './types/inquiries.type';

const inquiryListInclude = {
  product: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
      store: { select: { id: true, name: true } },
    },
  },
  buyer: { select: { id: true, name: true } },
};

const inquiryDetailInclude = {
  product: {
    select: {
      id: true,
      store: { select: { id: true, sellerId: true, name: true } },
    },
  },
  buyer: { select: { id: true, name: true } },
  answer: {
    include: {
      seller: { select: { id: true, name: true } },
    },
  },
};

const replyInclude = {
  seller: { select: { id: true, name: true } },
};

export class InquiriesRepository {
  async findManyMyInquiries(params: InquiriesListFilter) {
    const { userId, role, page, pageSize, status } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.InquiryWhereInput = {
      ...(status ? { status } : {}),
      ...(role === 'BUYER'
        ? { buyerId: userId }
        : role === 'SELLER'
          ? { product: { store: { sellerId: userId } } }
          : {}),
    };

    const [list, totalCount] = await prisma.$transaction([
      prisma.inquiry.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: inquiryListInclude,
      }),
      prisma.inquiry.count({ where }),
    ]);

    return { list, totalCount };
  }

  findInquiryById(inquiryId: string) {
    return prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: inquiryDetailInclude,
    });
  }

  createInquiry(data: {
    productId: string;
    buyerId: string;
    title: string;
    content: string;
    isSecret: boolean;
  }) {
    return prisma.inquiry.create({
      data,
      include: inquiryDetailInclude,
    });
  }

  updateInquiry(
    inquiryId: string,
    data: { title?: string; content?: string; isSecret?: boolean },
  ) {
    return prisma.inquiry.update({
      where: { id: inquiryId },
      data,
      include: inquiryDetailInclude,
    });
  }

  deleteInquiry(inquiryId: string) {
    return prisma.inquiry.delete({
      where: { id: inquiryId },
      include: inquiryDetailInclude,
    });
  }

  async createReply(inquiryId: string, sellerId: string, content: string) {
    return prisma.$transaction(async (tx) => {
      const createdReply = await tx.inquiryAnswer.create({
        data: { inquiryId, sellerId, content },
        include: replyInclude,
      });

      await tx.inquiry.update({
        where: { id: inquiryId },
        data: { status: InquiryStatus.CompletedAnswer },
      });

      return createdReply;
    });
  }

  findReplyById(replyId: string) {
    return prisma.inquiryAnswer.findUnique({
      where: { id: replyId },
      include: {
        inquiry: {
          include: {
            product: {
              select: {
                store: { select: { sellerId: true } },
              },
            },
          },
        },
        seller: { select: { id: true, name: true } },
      },
    });
  }

  updateReply(replyId: string, content: string) {
    return prisma.inquiryAnswer.update({
      where: { id: replyId },
      data: { content },
      include: replyInclude,
    });
  }

  async deleteReply(replyId: string) {
    return prisma.$transaction(async (tx) => {
      const deletedReply = await tx.inquiryAnswer.delete({
        where: { id: replyId },
        include: replyInclude,
      });

      await tx.inquiry.update({
        where: { id: deletedReply.inquiryId },
        data: { status: InquiryStatus.WaitingAnswer },
      });

      return deletedReply;
    });
  }
}
