export const inquiryInclude = {
  buyer: {
    select: {
      id: true,
      name: true,
      type: true,
    },
  },
  product: {
    include: {
      store: {
        select: {
          id: true,
          name: true,
          sellerId: true,
        },
      },
    },
  },
  answer: {
    include: {
      seller: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

export const inquiryAnswerInclude = {
  seller: {
    select: {
      id: true,
      name: true,
    },
  },
  inquiry: {
    include: {
      product: {
        include: {
          store: {
            select: {
              id: true,
              name: true,
              sellerId: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;
