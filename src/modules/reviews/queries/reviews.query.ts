export const reviewInclude = {
  buyer: {
    select: {
      id: true,
      name: true,
      type: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
    },
  },
  orderItem: {
    include: {
      order: {
        select: {
          id: true,
          createdAt: true,
          status: true,
          payment: {
            select: {
              status: true,
            },
          },
        },
      },
      size: {
        select: {
          id: true,
          nameEn: true,
          nameKo: true,
        },
      },
    },
  },
} as const;

export const reviewOrderItemInclude = {
  order: {
    select: {
      id: true,
      buyerId: true,
      status: true,
      payment: {
        select: {
          status: true,
        },
      },
    },
  },
  product: {
    select: {
      id: true,
    },
  },
} as const;

export const reviewSelect = {
  id: true,
  buyerId: true,
  productId: true,
  orderItemId: true,
  rating: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  buyer: {
    select: {
      name: true,
    },
  },
} as const;
