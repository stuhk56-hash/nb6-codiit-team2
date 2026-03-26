const {
  PrismaClient,
  UserType,
  InquiryStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
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

const categoryNames = [
  'TOP',
  'BOTTOM',
  'OUTER',
  'DRESS',
  'SKIRT',
  'SHOES',
  'ACC',
];
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

// 결제 수단 옵션
const paymentMethods = [
  PaymentMethod.CREDIT_CARD,
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.MOBILE_PHONE,
];

async function resetData() {
  await prisma.notification.deleteMany();
  await prisma.shippingHistory.deleteMany();
  await prisma.shipping.deleteMany();
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
        const soldOut = false; // ✅ 모두 재고 있음
        const basePrice = 20000 + s * 5000 + c * 4000 + p * 1500;
        const discountRate = p % 2 === 0 ? 10 : 0;

        const product = await prisma.product.create({
          data: {
            storeId: stores[s].id,
            categoryId: category.id,
            name: `스토어${s + 1} ${category.name} 상품${p}`,
            content: `스토어${s + 1} ${category.name} 상품${p} 상세 설명`,
            price: basePrice,
            // ✅ 모두 이미지 포함
            imageUrl: `https://picsum.photos/seed/product-${s + 1}-${category.name}-${p}/500/500`,
            discountRate,
            discountStartTime:
              discountRate > 0
                ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                : null,
            discountEndTime:
              discountRate > 0
                ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
                : null,
            isSoldOut: soldOut,
          },
        });

        for (let i = 0; i < sizes.length; i += 1) {
          await prisma.productStock.create({
            data: {
              productId: product.id,
              sizeId: sizes[i].id,
              quantity: 10 + i + p, // ✅ 모두 재고 있음
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
      const product =
        products[(b * CART_ITEMS_PER_BUYER + i) % products.length];
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

function getRandomPaymentMethod(index) {
  return paymentMethods[index % paymentMethods.length];
}

function generateTrackingNumber() {
  return String(Math.floor(Math.random() * 10000000000000));
}

async function seedOrdersAndReviews(buyers, products, sizes) {
  let reviewCount = 0;

  for (let b = 0; b < buyers.length; b += 1) {
    for (let i = 0; i < ORDERS_PER_BUYER; i += 1) {
      // ✅ 모든 Order를 CompletedPayment로 설정
      const status = OrderStatus.CompletedPayment;
      const createdAt = new Date(
        Date.now() - (b * ORDERS_PER_BUYER + i) * 24 * 60 * 60 * 1000,
      );

      const order = await prisma.order.create({
        data: {
          buyerId: buyers[b].id,
          status, // ✅ CompletedPayment
          buyerName: buyers[b].name,
          phoneNumber: `010-2000-${String(1000 + b * 10 + i)}`,
          address: `서울시 주문로 ${b + 1}-${i + 1}`,
          usedPoints: i * 100,
          earnedPoints: 500 + i * 50, // ✅ 모두 포인트 적립
          createdAt,
          updatedAt: createdAt,
        },
      });

      const itemCount = i % 2 === 0 ? 2 : 1;
      let totalPrice = 0;

      for (let k = 0; k < itemCount; k += 1) {
        const product =
          products[(b * ORDERS_PER_BUYER + i + k) % products.length];
        const size = sizes[(i + k) % sizes.length];
        const quantity = 1 + ((i + k) % 2);
        const unitPrice = Math.floor(
          product.price * (1 - (product.discountRate ?? 0) / 100),
        );

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

        // ✅ 각 OrderItem마다 최대 1개 리뷰만 생성
        if (reviewCount < COUNT * COUNT) {
          await prisma.review.create({
            data: {
              buyerId: buyers[b].id,
              productId: product.id,
              orderItemId: orderItem.id, // ✅ UNIQUE
              rating: (reviewCount % 5) + 1,
              content: `리뷰 테스트 ${reviewCount + 1}: 만족도 ${(reviewCount % 5) + 1}점`,
            },
          });
          reviewCount += 1;
        }
      }

      const paymentMethod = getRandomPaymentMethod(b + i);

      await prisma.payment.create({
        data: {
          orderId: order.id,
          price: totalPrice - i * 100,
          status: PaymentStatus.CompletedPayment, // ✅ 모두 결제 완료
          paymentMethod: paymentMethod,
          cardNumber:
            paymentMethod === PaymentMethod.CREDIT_CARD ? '1234' : null,
          bankName:
            paymentMethod === PaymentMethod.BANK_TRANSFER ? '신한은행' : null,
          phoneNumber:
            paymentMethod === PaymentMethod.MOBILE_PHONE
              ? `010-2000-${String(1000 + b)}`
              : null,
          createdAt,
          updatedAt: createdAt,
        },
      });

      // ✅ 모든 Order에 Shipping 데이터 생성
      await prisma.shipping.create({
        data: {
          orderId: order.id,
          status: 'Delivered', // ✅ 모두 배송완료
          trackingNumber: generateTrackingNumber(),
          carrier: '로켓배송',
          readyToShipAt: new Date(createdAt.getTime() + 1 * 60 * 60 * 1000),
          inShippingAt: new Date(createdAt.getTime() + 6 * 60 * 60 * 1000),
          deliveredAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
          createdAt,
          updatedAt: createdAt,
        },
      });
    }
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
          status: completed
            ? InquiryStatus.CompletedAnswer
            : InquiryStatus.WaitingAnswer,
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
  console.log(
    `Sellers: ${sellers.length}, Buyers: ${buyers.length}, Stores: ${stores.length}`,
  );
  console.log(
    `Products: ${products.length}, Categories: ${categories.length}, Sizes: ${sizes.length}`,
  );
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
