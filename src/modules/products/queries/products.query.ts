import { Prisma } from '@prisma/client';

export const productInclude = Prisma.validator<Prisma.ProductInclude>()({
  store: true,
  category: true,
  stocks: {
    include: {
      size: true,
    },
  },
  sizeSpecs: {
    orderBy: {
      displayOrder: 'asc',
    },
  },
  reviews: true,
  inquiries: {
    include: {
      answer: true,
      buyer: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
  orderItems: true,
});
