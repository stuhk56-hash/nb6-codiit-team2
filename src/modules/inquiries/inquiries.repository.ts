import { InquiryStatus, Prisma } from '@prisma/client';
import prisma from '../../configs/prisma';

type InquiryRole = 'BUYER' | 'SELLER' | 'ADMIN';

export class InquiriesRepository {
  async findManyMyInquiries(params: {
    userId: string;
    role: InquiryRole;
    page: number;
    pageSize: number;
    status?: InquiryStatus;
  }) {
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
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              store: { select: { id: true, name: true } },
            },
          },
          buyer: { select: { id: true, name: true } },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return { list, totalCount };
  }

  findInquiryById(inquiryId: string) {
    return prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
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
      },
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
      include: {
        answer: {
          include: { seller: { select: { id: true, name: true } } },
        },
      },
    });
  }

  updateInquiry(
    inquiryId: string,
    data: { title?: string; content?: string; isSecret?: boolean },
  ) {
    return prisma.inquiry.update({
      where: { id: inquiryId },
      data,
      include: {
        answer: {
          include: { seller: { select: { id: true, name: true } } },
        },
      },
    });
  }

  deleteInquiry(inquiryId: string) {
    return prisma.inquiry.delete({
      where: { id: inquiryId },
      include: {
        answer: {
          include: { seller: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async createReply(inquiryId: string, sellerId: string, content: string) {
    return prisma.$transaction(async (tx) => {
      const reply = await tx.inquiryAnswer.create({
        data: { inquiryId, sellerId, content },
        include: { seller: { select: { id: true, name: true } } },
      });

      await tx.inquiry.update({
        where: { id: inquiryId },
        data: { status: InquiryStatus.CompletedAnswer },
      });

      return reply;
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
      include: { seller: { select: { id: true, name: true } } },
    });
  }
}
