import { InquiryStatus } from '@prisma/client';
import {
  InquiryForbiddenError,
  InquiryNotFoundError,
  InquiryUnauthorizedError,
  InquiryValidationError,
} from './inquiries.errors';
import { InquiriesService } from './inquiries.service';

function makeRepositoryMock() {
  return {
    findManyMyInquiries: jest.fn(),
    findInquiryById: jest.fn(),
    createInquiry: jest.fn(),
    updateInquiry: jest.fn(),
    deleteInquiry: jest.fn(),
    createReply: jest.fn(),
    findReplyById: jest.fn(),
    updateReply: jest.fn(),
    deleteReply: jest.fn(),
  };
}

describe('InquiriesService', () => {
  const buyer = { id: 'buyer-1', role: 'BUYER' as const };
  const seller = { id: 'seller-1', role: 'SELLER' as const };

  it('문의 생성: 비로그인 사용자는 실패한다', async () => {
    const repository = makeRepositoryMock();
    const service = new InquiriesService(repository as any);

    await expect(
      service.createInquiry(undefined, {
        productId: 'p1',
        title: '문의',
        content: '내용',
      }),
    ).rejects.toBeInstanceOf(InquiryUnauthorizedError);
  });

  it('문의 수정: 답변 완료된 문의는 수정 불가', async () => {
    const repository = makeRepositoryMock();
    repository.findInquiryById.mockResolvedValue({
      id: 'inq-1',
      buyerId: 'buyer-1',
      status: InquiryStatus.CompletedAnswer,
    });

    const service = new InquiriesService(repository as any);

    await expect(
      service.updateInquiry(buyer, 'inq-1', { title: '수정' }),
    ).rejects.toBeInstanceOf(InquiryValidationError);
  });

  it('문의 목록: page 파라미터가 정수가 아니면 실패', async () => {
    const repository = makeRepositoryMock();
    const service = new InquiriesService(repository as any);

    await expect(
      service.getMyInquiries(buyer, { page: 'abc', pageSize: '10' }),
    ).rejects.toBeInstanceOf(InquiryValidationError);
  });

  it('답변 생성: 해당 상품 판매자가 아니면 실패', async () => {
    const repository = makeRepositoryMock();
    repository.findInquiryById.mockResolvedValue({
      id: 'inq-1',
      answer: null,
      product: {
        store: {
          sellerId: 'other-seller',
        },
      },
    });
    const service = new InquiriesService(repository as any);

    await expect(
      service.createReply(seller, 'inq-1', { content: '답변' }),
    ).rejects.toBeInstanceOf(InquiryForbiddenError);
  });

  it('답변 수정: reply가 없으면 404', async () => {
    const repository = makeRepositoryMock();
    repository.findReplyById.mockResolvedValue(null);
    const service = new InquiriesService(repository as any);

    await expect(
      service.updateReply(seller, 'reply-1', { content: '수정답변' }),
    ).rejects.toBeInstanceOf(InquiryNotFoundError);
  });

  it('답변 삭제: 작성자면 성공', async () => {
    const repository = makeRepositoryMock();
    repository.findReplyById.mockResolvedValue({
      id: 'reply-1',
      sellerId: 'seller-1',
      inquiry: {
        product: {
          store: {
            sellerId: 'seller-1',
          },
        },
      },
    });
    repository.deleteReply.mockResolvedValue({
      id: 'reply-1',
      inquiryId: 'inq-1',
      sellerId: 'seller-1',
      content: '삭제될 답변',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      seller: { id: 'seller-1', name: '판매자' },
    });

    const service = new InquiriesService(repository as any);
    const result = await service.deleteReply(seller, 'reply-1');

    expect(repository.deleteReply).toHaveBeenCalledWith('reply-1');
    expect(result).toMatchObject({
      id: 'reply-1',
      inquiryId: 'inq-1',
      userId: 'seller-1',
    });
  });
});
