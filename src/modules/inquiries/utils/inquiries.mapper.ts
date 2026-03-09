export function toInquiryListItem(inquiry: any) {
  return {
    id: inquiry.id,
    title: inquiry.title,
    isSecret: inquiry.isSecret,
    status: inquiry.status,
    product: {
      id: inquiry.product.id,
      name: inquiry.product.name,
      image: inquiry.product.imageUrl,
      store: inquiry.product.store,
    },
    user: inquiry.buyer,
    createdAt: inquiry.createdAt,
    content: inquiry.content,
  };
}

export function toReplyResponse(reply: any) {
  return {
    id: reply.id,
    inquiryId: reply.inquiryId,
    userId: reply.sellerId,
    content: reply.content,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
  };
}

export function toInquiryDetail(inquiry: any) {
  return {
    id: inquiry.id,
    userId: inquiry.buyerId,
    productId: inquiry.productId,
    title: inquiry.title,
    content: inquiry.content,
    status: inquiry.status,
    isSecret: inquiry.isSecret,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
    reply: toInquiryDetailReply(inquiry.answer),
  };
}

export function toInquiryDetailReply(reply: any) {
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
