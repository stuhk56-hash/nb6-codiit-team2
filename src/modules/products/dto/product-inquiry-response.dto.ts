export type ProductInquiryResponseDto = {
  id: string;
  productId: string;
  userId: string;
  title: string;
  content: string;
  isSecret: boolean;
  status: 'WaitingAnswer' | 'CompletedAnswer';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
  reply: {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
    };
  } | null;
};
