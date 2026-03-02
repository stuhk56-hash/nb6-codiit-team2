import { ReplyEntity } from './reply.entity';

type RawInquiryListItem = {
  id: string;
  title: string;
  content: string;
  isSecret: boolean;
  status: string;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    store: {
      id: string;
      name: string;
    };
  };
  buyer: {
    id: string;
    name: string;
  };
};

type RawInquiryDetail = {
  id: string;
  buyerId: string;
  productId: string;
  title: string;
  content: string;
  status: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
  answer?: {
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
  } | null;
};

export class InquiryEntity {
  static toListItem(inquiry: RawInquiryListItem) {
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

  static toDetail(inquiry: RawInquiryDetail) {
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
      reply: ReplyEntity.forInquiryDetail(inquiry.answer),
    };
  }
}
