import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';
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
  requireInquiry,
  requireReply,
  resolveInquiryProductImage,
} from '../utils/inquiries.service.util';

jest.mock('../../s3/utils/s3.service.util', () => ({
  resolveS3ImageUrl: jest.fn(),
}));

function createInquiry(partial: Partial<any> = {}) {
  return {
    id: 'inquiry-1',
    buyerId: 'buyer-1',
    status: 'WaitingAnswer',
    answer: null,
    product: {
      id: 'product-1',
      imageUrl: null,
      imageKey: 'product.png',
      store: {
        sellerId: 'seller-1',
      },
    },
    ...partial,
  } as any;
}

function createReply(partial: Partial<any> = {}) {
  return {
    id: 'reply-1',
    sellerId: 'seller-1',
    inquiry: {
      product: {
        store: {
          sellerId: 'seller-1',
        },
      },
    },
    ...partial,
  } as any;
}

describe('inquiries.service.util', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('normalizeInquiriesQuery는 기본 page/pageSize를 채운다', () => {
    expect(normalizeInquiriesQuery({})).toEqual({
      page: 1,
      pageSize: 16,
      status: undefined,
    });
  });

  test('requireInquiry와 requireReply는 null이면 NotFoundError를 던진다', () => {
    expect(() => requireInquiry(null)).toThrow(NotFoundError);
    expect(() => requireReply(null)).toThrow(NotFoundError);
  });

  test('ensureInquiryAccessible는 다른 구매자 또는 다른 판매자면 ForbiddenError를 던진다', () => {
    expect(() =>
      ensureInquiryAccessible('buyer-2', 'BUYER', createInquiry()),
    ).toThrow(ForbiddenError);

    expect(() =>
      ensureInquiryAccessible('seller-2', 'SELLER', createInquiry()),
    ).toThrow(ForbiddenError);
  });

  test('ensureInquiryBuyerOwner, ensureInquirySellerOwner, ensureReplySellerOwner는 소유자가 다르면 ForbiddenError를 던진다', () => {
    expect(() => ensureInquiryBuyerOwner('buyer-2', createInquiry())).toThrow(
      ForbiddenError,
    );
    expect(() =>
      ensureInquirySellerOwner('seller-2', createInquiry()),
    ).toThrow(ForbiddenError);
    expect(() => ensureReplySellerOwner('seller-2', createReply())).toThrow(
      ForbiddenError,
    );
  });

  test('ensureInquiryUpdatable, ensureReplyCreatable, ensureReplyDeletable는 상태에 따라 BadRequestError를 던진다', () => {
    expect(() =>
      ensureInquiryUpdatable(
        createInquiry({
          status: 'CompletedAnswer',
        }),
      ),
    ).toThrow(BadRequestError);

    expect(() =>
      ensureReplyCreatable(
        createInquiry({
          answer: { id: 'reply-1' },
        }),
      ),
    ).toThrow(BadRequestError);

    expect(() => ensureReplyDeletable(createInquiry())).toThrow(
      BadRequestError,
    );
  });

  test('ensureUpdateInquiryInput과 ensureUpdateReplyInput은 빈 입력이면 BadRequestError를 던진다', () => {
    expect(() => ensureUpdateInquiryInput({})).toThrow(BadRequestError);
    expect(() => ensureUpdateReplyInput({})).toThrow(BadRequestError);
  });

  test('resolveInquiryProductImage는 resolveS3ImageUrl 결과로 imageUrl을 갱신한다', async () => {
    (resolveS3ImageUrl as jest.Mock).mockResolvedValue(
      'https://cdn.example.com/product.png',
    );
    const inquiry = createInquiry();

    const result = await resolveInquiryProductImage(inquiry);

    expect(resolveS3ImageUrl).toHaveBeenCalledWith(
      null,
      'product.png',
      '/images/Mask-group.svg',
    );
    expect(result.product.imageUrl).toBe('https://cdn.example.com/product.png');
  });
});
