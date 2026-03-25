import { inquiriesRepository } from '../inquiries.repository';
import { InquiriesService } from '../inquiries.service';
import {
  toInquiryListResponseDto,
  toInquiryReplyResponseDto,
  toInquiryResponseDto,
} from '../utils/inquiries.mapper';
import {
  ensureInquiryAccessible,
  ensureInquiryBuyerOwner,
  ensureInquirySellerOwner,
  ensureInquiryUpdatable,
  ensureReplyCreatable,
  ensureReplyDeletable,
  ensureReplySellerOwner,
  ensureUpdateInquiryInput,
  ensureUpdateReplyInput,
  normalizeInquiriesQuery,
  resolveInquiriesProductImages,
  requireInquiry,
  requireReply,
} from '../utils/inquiries.service.util';

jest.mock('../inquiries.repository', () => ({
  inquiriesRepository: {
    findPageByUser: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    deleteReplyByInquiryId: jest.fn(),
    createReply: jest.fn(),
    findReplyById: jest.fn(),
    updateReplyById: jest.fn(),
  },
}));

jest.mock('../utils/inquiries.mapper', () => ({
  toInquiryListResponseDto: jest.fn((inquiries: any[], totalCount: number) => ({
    list: inquiries,
    totalCount,
  })),
  toInquiryResponseDto: jest.fn((inquiry: any) => ({ id: inquiry.id })),
  toInquiryReplyResponseDto: jest.fn((reply: any) => ({ id: reply.id })),
}));

jest.mock('../utils/inquiries.service.util', () => ({
  ensureInquiryAccessible: jest.fn(),
  ensureInquiryBuyerOwner: jest.fn(),
  ensureInquirySellerOwner: jest.fn(),
  ensureInquiryUpdatable: jest.fn(),
  ensureReplyCreatable: jest.fn(),
  ensureReplyDeletable: jest.fn(),
  ensureReplySellerOwner: jest.fn(),
  ensureUpdateInquiryInput: jest.fn(),
  ensureUpdateReplyInput: jest.fn(),
  normalizeInquiriesQuery: jest.fn(),
  resolveInquiriesProductImages: jest.fn(async (inquiries: unknown[]) => inquiries),
  requireInquiry: jest.fn((value: unknown) => value),
  requireReply: jest.fn((value: unknown) => value),
}));

describe('inquiries.service', () => {
  const service = new InquiriesService();
  const mockedRepository = inquiriesRepository as jest.Mocked<
    typeof inquiriesRepository
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('findMyInquiries - 필터/페이지네이션을 검증한다', async () => {
    const user = { id: 'buyer-1', type: 'BUYER' } as any;
    const normalized = { page: 1, pageSize: 16, status: 'CompletedAnswer' } as any;
    const inquiries = [{ id: 'inquiry-1' }] as any[];
    (normalizeInquiriesQuery as jest.Mock).mockReturnValue(normalized);
    mockedRepository.findPageByUser.mockResolvedValue({
      inquiries,
      totalCount: 1,
    } as any);

    const result = await service.findMyInquiries(user, {
      status: 'CompletedAnswer' as any,
    });

    expect(normalizeInquiriesQuery).toHaveBeenCalledWith({
      status: 'CompletedAnswer',
    });
    expect(mockedRepository.findPageByUser).toHaveBeenCalledWith(
      'buyer-1',
      'BUYER',
      normalized,
    );
    expect(resolveInquiriesProductImages).toHaveBeenCalledWith(inquiries);
    expect(toInquiryListResponseDto).toHaveBeenCalledWith(inquiries, 1);
    expect(result).toEqual({ list: inquiries, totalCount: 1 });
  });

  test('findOneInquiry - 비밀문의 권한 체크를 검증한다', async () => {
    const user = { id: 'buyer-1', type: 'BUYER' } as any;
    const inquiry = { id: 'inquiry-1' } as any;
    mockedRepository.findById.mockResolvedValue(inquiry);

    const result = await service.findOneInquiry(user, 'inquiry-1');

    expect(requireInquiry).toHaveBeenCalledWith(inquiry, '문의가 존재하지 않습니다.');
    expect(ensureInquiryAccessible).toHaveBeenCalledWith(
      'buyer-1',
      'BUYER',
      inquiry,
    );
    expect(toInquiryResponseDto).toHaveBeenCalledWith(inquiry);
    expect(result).toEqual({ id: 'inquiry-1' });
  });

  test('updateInquiry - 답변 상태에 따른 수정 가능 여부를 검증한다', async () => {
    const inquiry = { id: 'inquiry-1', buyerId: 'buyer-1' } as any;
    const updated = { id: 'inquiry-1' } as any;
    mockedRepository.findById.mockResolvedValue(inquiry);
    mockedRepository.updateById.mockResolvedValue(updated);

    const result = await service.updateInquiry('buyer-1', 'inquiry-1', {
      title: '수정 제목',
    });

    expect(ensureUpdateInquiryInput).toHaveBeenCalledWith({
      title: '수정 제목',
    });
    expect(requireInquiry).toHaveBeenCalledWith(inquiry);
    expect(ensureInquiryBuyerOwner).toHaveBeenCalledWith('buyer-1', inquiry);
    expect(ensureInquiryUpdatable).toHaveBeenCalledWith(inquiry);
    expect(mockedRepository.updateById).toHaveBeenCalledWith('inquiry-1', {
      title: '수정 제목',
    });
    expect(toInquiryResponseDto).toHaveBeenCalledWith(updated);
    expect(result).toEqual({ id: 'inquiry-1' });
  });

  test('deleteInquiry - 삭제 권한을 검증한다', async () => {
    const inquiry = { id: 'inquiry-1' } as any;
    mockedRepository.findById.mockResolvedValue(inquiry);
    mockedRepository.deleteById.mockResolvedValue(inquiry);
    mockedRepository.deleteReplyByInquiryId.mockResolvedValue(inquiry);

    const buyerResult = await service.deleteInquiry(
      { id: 'buyer-1', type: 'BUYER' } as any,
      'inquiry-1',
    );

    expect(ensureInquiryBuyerOwner).toHaveBeenCalledWith('buyer-1', inquiry);
    expect(mockedRepository.deleteById).toHaveBeenCalledWith('inquiry-1');
    expect(buyerResult).toEqual({ id: 'inquiry-1' });

    const sellerResult = await service.deleteInquiry(
      { id: 'seller-1', type: 'SELLER' } as any,
      'inquiry-1',
    );

    expect(ensureInquirySellerOwner).toHaveBeenCalledWith('seller-1', inquiry);
    expect(ensureReplyDeletable).toHaveBeenCalledWith(inquiry);
    expect(mockedRepository.deleteReplyByInquiryId).toHaveBeenCalledWith(
      'inquiry-1',
    );
    expect(sellerResult).toEqual({ id: 'inquiry-1' });
  });

  test('replyCreate/replyUpdate - 판매자 권한과 상태 변경을 검증한다', async () => {
    const inquiry = { id: 'inquiry-1' } as any;
    const reply = { id: 'reply-1' } as any;
    mockedRepository.findById.mockResolvedValue(inquiry);
    mockedRepository.createReply.mockResolvedValue(reply);
    mockedRepository.findReplyById.mockResolvedValue(reply);
    mockedRepository.updateReplyById.mockResolvedValue(reply);

    const created = await service.replyCreate('seller-1', 'inquiry-1', {
      content: '답변',
    });

    expect(requireInquiry).toHaveBeenCalledWith(inquiry);
    expect(ensureInquirySellerOwner).toHaveBeenCalledWith('seller-1', inquiry);
    expect(ensureReplyCreatable).toHaveBeenCalledWith(inquiry);
    expect(mockedRepository.createReply).toHaveBeenCalledWith(
      'inquiry-1',
      'seller-1',
      '답변',
    );
    expect(toInquiryReplyResponseDto).toHaveBeenCalledWith(reply);
    expect(created).toEqual({ id: 'reply-1' });

    const updated = await service.replyUpdate('seller-1', 'reply-1', {
      content: '수정 답변',
    });

    expect(ensureUpdateReplyInput).toHaveBeenCalledWith({
      content: '수정 답변',
    });
    expect(requireReply).toHaveBeenCalledWith(reply);
    expect(ensureReplySellerOwner).toHaveBeenCalledWith('seller-1', reply);
    expect(mockedRepository.updateReplyById).toHaveBeenCalledWith('reply-1', {
      content: '수정 답변',
    });
    expect(updated).toEqual({ id: 'reply-1' });
  });
});
