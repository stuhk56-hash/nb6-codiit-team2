export const storeInclude = {
  _count: {
    select: {
      favoritedBy: true,
      products: true,
    },
  },
} as const;

export const myStoreInclude = {
  ...storeInclude,
  favoritedBy: {
    select: {
      createdAt: true,
    },
  },
  products: {
    include: {
      stocks: true,
      orderItems: true,
    },
  },
} as const;

export const myStoreProductInclude = {
  stocks: true,
} as const;
