type RawReply = {
  id: string;
  inquiryId: string;
  sellerId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  seller?: {
    id: string;
    name: string;
  } | null;
};

export class ReplyEntity {
  // 답변 단건 API 응답 형식으로 변환
  static fromReply(reply: RawReply) {
    return {
      id: reply.id,
      inquiryId: reply.inquiryId,
      userId: reply.sellerId,
      content: reply.content,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
    };
  }

  // 문의 상세 응답 내 reply 중첩 객체 형식으로 변환
  static forInquiryDetail(reply?: RawReply | null) {
    if (!reply) return null;

    return {
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      user: reply.seller
        ? {
            id: reply.seller.id,
            name: reply.seller.name,
          }
        : null,
    };
  }
}
