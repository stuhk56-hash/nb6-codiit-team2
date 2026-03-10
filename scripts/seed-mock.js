const {
  PrismaClient,
  UserType,
  InquiryStatus,
  OrderStatus,
  PaymentStatus,
} = require('@prisma/client');
const { randomBytes, scryptSync } = require('crypto');

const prisma = new PrismaClient();

const COUNT = 5;
const PRODUCTS_PER_CATEGORY = 5;
const CART_ITEMS_PER_BUYER = 5;
const ORDERS_PER_BUYER = 5;
const INQUIRIES_PER_BUYER = 5;
const NOTIFICATIONS_PER_USER = 5;
const DEFAULT_PASSWORD = 'codiit1234';
const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;

function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

const categoryNames = ['TOP', 'BOTTOM', 'OUTER', 'DRESS', 'SKIRT', 'SHOES', 'ACC'];
const sizeDefs = [
  { id: 1, name: 'XS', nameEn: 'XS', nameKo: 'XS' },
  { id: 2, name: 'S', nameEn: 'S', nameKo: 'S' },
  { id: 3, name: 'M', nameEn: 'M', nameKo: 'M' },
  { id: 4, name: 'L', nameEn: 'L', nameKo: 'L' },
  { id: 5, name: 'XL', nameEn: 'XL', nameKo: 'XL' },
];

const gradeDefs = [
  { id: 'grade_green', name: 'Green', rate: 1, minAmount: 0 },
  { id: 'grade_orange', name: 'Orange', rate: 2, minAmount: 100000 },
  { id: 'grade_red', name: 'Red', rate: 3, minAmount: 300000 },
  { id: 'grade_black', name: 'Black', rate: 4, minAmount: 500000 },
  { id: 'grade_vip', name: 'VIP', rate: 5, minAmount: 1000000 },
];

async function resetData() {
  await prisma.notification.deleteMany();
  await prisma.inquiryAnswer.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storeFavorite.deleteMany();
  await prisma.store.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.size.deleteMany();
}

async function seedGrades() {
  for (const grade of gradeDefs) {
    await prisma.grade.create({ data: grade });
  }
  return gradeDefs;
}

async function seedUsers(grades) {
  const sellers = [];
  const buyers = [];

  for (let i = 1; i <= COUNT; i += 1) {
    const seller = await prisma.user.create({
      data: {
        type: UserType.SELLER,
        email: `seller${i}@codiit.com`,
        name: `셀러${i}`,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
        imageUrl: `https://picsum.photos/seed/seller-${i}/200/200`,
      },
    });
    sellers.push(seller);

    const buyer = await prisma.user.create({
      data: {
        type: UserType.BUYER,
        email: `buyer${i}@codiit.com`,
        name: `바이어${i}`,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
        imageUrl: `https://picsum.photos/seed/buyer-${i}/200/200`,
        points: i * 5000,
        gradeId: grades[(i - 1) % grades.length].id,
      },
    });
    buyers.push(buyer);
  }

  for (let i = 0; i < sellers.length; i += 1) {
    await prisma.refreshToken.create({
      data: {
        userId: sellers[i].id,
        tokenHash: `seed-refresh-seller-${i + 1}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  for (let i = 0; i < buyers.length; i += 1) {
    await prisma.refreshToken.create({
      data: {
        userId: buyers[i].id,
        tokenHash: `seed-refresh-buyer-${i + 1}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  return { sellers, buyers };
}

async function seedStores(sellers) {
  const stores = [];
  for (let i = 0; i < sellers.length; i += 1) {
    const store = await prisma.store.create({
      data: {
        sellerId: sellers[i].id,
        name: `코디잇 스토어 ${i + 1}`,
        address: `서울시 테스트구 테스트로 ${i + 1}`,
        detailAddress: `${100 + i}호`,
        phoneNumber: `02-0000-${String(1000 + i)}`,
        content: `테스트 스토어 소개 ${i + 1}`,
        imageUrl: `https://picsum.photos/seed/store-${i + 1}/400/400`,
      },
    });
    stores.push(store);
  }
  return stores;
}

async function seedCategories() {
  const categories = [];
  for (const name of categoryNames) {
    categories.push(await prisma.category.create({ data: { name } }));
  }
  return categories;
}

async function seedSizes() {
  const sizes = [];
  for (const def of sizeDefs) {
    sizes.push(await prisma.size.create({ data: def }));
  }
  return sizes;
}

async function seedProducts(stores, categories, sizes) {
  const products = [];

  for (let s = 0; s < stores.length; s += 1) {
    for (let c = 0; c < categories.length; c += 1) {
      const category = categories[c];

      for (let p = 1; p <= PRODUCTS_PER_CATEGORY; p += 1) {
        const soldOut = p === PRODUCTS_PER_CATEGORY;
        const basePrice = 20000 + s * 5000 + c * 4000 + p * 1500;
        const discountRate = p % 2 === 0 ? 10 : 0;

        const product = await prisma.product.create({
          data: {
            storeId: stores[s].id,
            categoryId: category.id,
            name: `스토어${s + 1} ${category.name} 상품${p}`,
            content: `스토어${s + 1} ${category.name} 상품${p} 상세 설명`,
            price: basePrice,
            imageUrl: p === 3 ? null : `https://picsum.photos/seed/product-${s + 1}-${category.name}-${p}/500/500`,
            discountRate,
            discountStartTime: discountRate > 0 ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null,
            discountEndTime: discountRate > 0 ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) : null,
            isSoldOut: soldOut,
          },
        });

        for (let i = 0; i < sizes.length; i += 1) {
          await prisma.productStock.create({
            data: {
              productId: product.id,
              sizeId: sizes[i].id,
              quantity: soldOut ? 0 : 10 + i + p,
            },
          });
        }

        products.push({
          ...product,
          sellerId: stores[s].sellerId,
        });
      }
    }
  }

  return products;
}

async function seedFavorites(buyers, stores) {
  for (let b = 0; b < buyers.length; b += 1) {
    for (let i = 0; i < COUNT; i += 1) {
      const store = stores[(b + i) % stores.length];
      await prisma.storeFavorite.create({
        data: {
          userId: buyers[b].id,
          storeId: store.id,
        },
      });
    }
  }
}

async function seedCarts(buyers, products, sizes) {
  for (let b = 0; b < buyers.length; b += 1) {
    const cart = await prisma.cart.create({
      data: { buyerId: buyers[b].id },
    });

    for (let i = 0; i < CART_ITEMS_PER_BUYER; i += 1) {
      const product = products[(b * CART_ITEMS_PER_BUYER + i) % products.length];
      const size = sizes[i % sizes.length];
      const stock = await prisma.productStock.findUnique({
        where: { productId_sizeId: { productId: product.id, sizeId: size.id } },
      });

      if (!stock || stock.quantity <= 0) {
        continue;
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          sizeId: size.id,
          quantity: Math.min(2 + (i % 2), stock.quantity),
        },
      });
    }
  }
}

function getOrderStatus(index) {
  const statuses = [
    OrderStatus.CompletedPayment,
    OrderStatus.WaitingPayment,
    OrderStatus.Canceled,
    OrderStatus.CompletedPayment,
    OrderStatus.CompletedPayment,
  ];
  return statuses[index % statuses.length];
}

function getPaymentStatus(orderStatus) {
  if (orderStatus === OrderStatus.CompletedPayment) return PaymentStatus.Paid;
  if (orderStatus === OrderStatus.Canceled) return PaymentStatus.Canceled;
  return PaymentStatus.Pending;
}

async function seedOrdersAndReviews(buyers, products, sizes) {
  const createdOrderItems = [];

  for (let b = 0; b < buyers.length; b += 1) {
    for (let i = 0; i < ORDERS_PER_BUYER; i += 1) {
      const status = getOrderStatus(i);
      const createdAt = new Date(Date.now() - (b * ORDERS_PER_BUYER + i) * 24 * 60 * 60 * 1000);

      const order = await prisma.order.create({
        data: {
          buyerId: buyers[b].id,
          status,
          buyerName: buyers[b].name,
          phoneNumber: `010-2000-${String(1000 + b * 10 + i)}`,
          address: `서울시 주문로 ${b + 1}-${i + 1}`,
          usedPoints: i * 100,
          earnedPoints: status === OrderStatus.CompletedPayment ? 500 + i * 50 : 0,
          createdAt,
          updatedAt: createdAt,
        },
      });

      const itemCount = i % 2 === 0 ? 2 : 1;
      let totalPrice = 0;

      for (let k = 0; k < itemCount; k += 1) {
        const product = products[(b * ORDERS_PER_BUYER + i + k) % products.length];
        const size = sizes[(i + k) % sizes.length];
        const quantity = 1 + ((i + k) % 2);
        const unitPrice = Math.floor(product.price * (1 - (product.discountRate ?? 0) / 100));

        const orderItem = await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            sizeId: size.id,
            quantity,
            unitPrice,
            productName: product.name,
            productImageUrl: product.imageUrl,
          },
        });

        totalPrice += unitPrice * quantity;
        createdOrderItems.push({ orderItem, buyerId: buyers[b].id, orderStatus: status });
      }

      await prisma.payment.create({
        data: {
          orderId: order.id,
          price: totalPrice - i * 100,
          status: getPaymentStatus(status),
          createdAt,
          updatedAt: createdAt,
        },
      });
    }
  }

  const reviewTargets = createdOrderItems
    .filter((row) => row.orderStatus === OrderStatus.CompletedPayment)
    .slice(0, COUNT * COUNT);

  for (let i = 0; i < reviewTargets.length; i += 1) {
    const target = reviewTargets[i];
    await prisma.review.create({
      data: {
        buyerId: target.buyerId,
        productId: target.orderItem.productId,
        orderItemId: target.orderItem.id,
        rating: (i % 5) + 1,
        content: `리뷰 테스트 ${i + 1}: 만족도 ${((i % 5) + 1)}점`,
      },
    });
  }
}

async function seedInquiriesAndReplies(buyers, products) {
  const inquiries = [];

  for (let b = 0; b < buyers.length; b += 1) {
    for (let i = 0; i < INQUIRIES_PER_BUYER; i += 1) {
      const product = products[(b * INQUIRIES_PER_BUYER + i) % products.length];
      const completed = i % 2 === 0;

      const inquiry = await prisma.inquiry.create({
        data: {
          productId: product.id,
          buyerId: buyers[b].id,
          title: `문의 제목 ${b + 1}-${i + 1}`,
          content: `문의 내용 ${b + 1}-${i + 1}`,
          isSecret: (b + i) % 3 === 0,
          status: completed ? InquiryStatus.CompletedAnswer : InquiryStatus.WaitingAnswer,
        },
      });

      if (completed) {
        await prisma.inquiryAnswer.create({
          data: {
            inquiryId: inquiry.id,
            sellerId: product.sellerId,
            content: `답변 내용 ${b + 1}-${i + 1}`,
          },
        });
      }

      inquiries.push(inquiry);
    }
  }

  return inquiries;
}

async function seedNotifications(sellers, buyers) {
  for (const seller of sellers) {
    for (let i = 1; i <= NOTIFICATIONS_PER_USER; i += 1) {
      await prisma.notification.create({
        data: {
          userId: seller.id,
          content: `판매자 알림 ${seller.name} - ${i}`,
          isChecked: i % 2 === 0,
        },
      });
    }
  }

  for (const buyer of buyers) {
    for (let i = 1; i <= NOTIFICATIONS_PER_USER; i += 1) {
      await prisma.notification.create({
        data: {
          userId: buyer.id,
          content: `구매자 알림 ${buyer.name} - ${i}`,
          isChecked: i % 2 === 0,
        },
      });
    }
  }
}

async function main() {
  await resetData();
  const grades = await seedGrades();
  const { sellers, buyers } = await seedUsers(grades);
  const stores = await seedStores(sellers);
  const categories = await seedCategories();
  const sizes = await seedSizes();
  const products = await seedProducts(stores, categories, sizes);

  await seedFavorites(buyers, stores);
  await seedCarts(buyers, products, sizes);
  await seedOrdersAndReviews(buyers, products, sizes);
  await seedInquiriesAndReplies(buyers, products);
  await seedNotifications(sellers, buyers);

  console.log('Mock seed completed');
  console.log(`Sellers: ${sellers.length}, Buyers: ${buyers.length}, Stores: ${stores.length}`);
  console.log(`Products: ${products.length}, Categories: ${categories.length}, Sizes: ${sizes.length}`);
  console.log(`Login accounts (password: ${DEFAULT_PASSWORD})`);
  for (let i = 1; i <= COUNT; i += 1) {
    console.log(`- seller${i}@codiit.com`);
  }
  for (let i = 1; i <= COUNT; i += 1) {
    console.log(`- buyer${i}@codiit.com`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
