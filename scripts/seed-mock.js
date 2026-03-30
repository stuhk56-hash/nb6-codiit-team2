const {
  PrismaClient,
  UserType,
  InquiryStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingStatus,
} = require('@prisma/client');
const { randomBytes, scryptSync } = require('crypto');

const prisma = new PrismaClient();

const SELLER_COUNT = 4;
const BUYER_COUNT = 8;
const PRODUCTS_PER_SELLER = 12;
const ORDERS_PER_BUYER = 6;
const INQUIRIES_PER_BUYER = 4;
const NOTIFICATIONS_PER_USER = 6;
const DEFAULT_PASSWORD = 'codiit1234';
const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;

const categoryNames = ['TOP', 'BOTTOM', 'OUTER', 'DRESS', 'SKIRT', 'SHOES', 'ACC'];
const sizeDefs = [
  { name: 'XS', nameEn: 'XS', nameKo: 'XS' },
  { name: 'S', nameEn: 'S', nameKo: 'S' },
  { name: 'M', nameEn: 'M', nameKo: 'M' },
  { name: 'L', nameEn: 'L', nameKo: 'L' },
  { name: 'XL', nameEn: 'XL', nameKo: 'XL' },
];
const gradeDefs = [
  { id: 'grade_green', name: 'Green', rate: 1, minAmount: 0 },
  { id: 'grade_orange', name: 'Orange', rate: 2, minAmount: 100000 },
  { id: 'grade_red', name: 'Red', rate: 3, minAmount: 300000 },
  { id: 'grade_black', name: 'Black', rate: 4, minAmount: 500000 },
  { id: 'grade_vip', name: 'VIP', rate: 5, minAmount: 1000000 },
];

function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function pick(list, index) {
  return list[index % list.length];
}

function randomTrackingNumber(seed) {
  return `TRK${String(100000000000 + seed).slice(0, 12)}`;
}

function makeBusinessRegistrationNumber(seed) {
  // 9자리 본체 + 체크디지트(국세청 규칙) 생성
  const body = String(120000000 + seed).padStart(9, '0');
  const numbers = body.split('').map(Number);
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  const weightedSum = weights.reduce(
    (sum, weight, index) => sum + numbers[index] * weight,
    0,
  );
  const carry = Math.floor((numbers[8] * 5) / 10);
  const checksum = (10 - ((weightedSum + carry) % 10)) % 10;
  const digits = `${body}${checksum}`;

  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`;
}

function shippingTimeline(createdAt) {
  const ready = new Date(createdAt.getTime() + 1 * 60 * 60 * 1000);
  const shipping = new Date(createdAt.getTime() + 8 * 60 * 60 * 1000);
  const delivered = new Date(createdAt.getTime() + 28 * 60 * 60 * 1000);
  return { ready, shipping, delivered };
}

function getPaymentStatusFromOrder(orderStatus, index) {
  if (orderStatus === OrderStatus.CompletedPayment) {
    return index % 7 === 0
      ? PaymentStatus.FailedPayment
      : PaymentStatus.CompletedPayment;
  }
  if (orderStatus === OrderStatus.Canceled) {
    return PaymentStatus.CanceledPayment;
  }
  return PaymentStatus.WaitingPayment;
}

function getShippingStatusFromOrder(orderStatus, index) {
  if (orderStatus !== OrderStatus.CompletedPayment) return ShippingStatus.ReadyToShip;
  if (index % 3 === 0) return ShippingStatus.Delivered;
  if (index % 3 === 1) return ShippingStatus.InShipping;
  return ShippingStatus.ReadyToShip;
}

function makeSizeSpecs(categoryName, i) {
  const rows = ['XS', 'S', 'M', 'L', 'XL'];

  if (categoryName === 'BOTTOM' || categoryName === 'SKIRT') {
    return rows.map((label, idx) => ({
      sizeLabel: label,
      displayOrder: idx,
      totalLengthCm: 90 + idx + i,
      waistCm: 31 + idx,
      hipCm: 45 + idx,
      thighCm: 26 + idx,
      riseCm: 26 + idx,
      hemCm: 22 + idx,
    }));
  }

  return rows.map((label, idx) => ({
    sizeLabel: label,
    displayOrder: idx,
    totalLengthCm: 58 + idx + i,
    shoulderCm: 41 + idx,
    chestCm: 49 + idx,
    sleeveCm: 58 + idx,
  }));
}

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
  await prisma.productSizeSpec.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storeFavorite.deleteMany();
  await prisma.storeAuditLog.deleteMany();
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

  for (let i = 1; i <= SELLER_COUNT; i += 1) {
    const seller = await prisma.user.create({
      data: {
        type: UserType.SELLER,
        email: `seller${i}@codiit.com`,
        name: `셀러${i}`,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
        imageUrl: `https://picsum.photos/seed/codiit-seller-${i}/200/200`,
      },
    });
    sellers.push(seller);
  }

  for (let i = 1; i <= BUYER_COUNT; i += 1) {
    const lifetimeSpend = i * 170000;
    const grade =
      [...grades]
        .reverse()
        .find((row) => row.minAmount <= lifetimeSpend) ?? grades[0];

    const buyer = await prisma.user.create({
      data: {
        type: UserType.BUYER,
        email: `buyer${i}@codiit.com`,
        name: `바이어${i}`,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
        imageUrl: `https://picsum.photos/seed/codiit-buyer-${i}/200/200`,
        points: 2000 + i * 3000,
        lifetimeSpend,
        gradeId: grade.id,
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
    const idx = i + 1;
    const store = await prisma.store.create({
      data: {
        sellerId: sellers[i].id,
        name: `코디잇 스토어 ${idx}`,
        address: `서울시 코디구 코디로 ${idx}`,
        detailAddress: `${200 + idx}호`,
        phoneNumber: `02-0000-${String(1100 + idx)}`,
        content: `코디잇 스토어 ${idx} 소개입니다.`,
        representativeName: `대표자${idx}`,
        businessRegistrationNumber: makeBusinessRegistrationNumber(idx),
        mailOrderSalesNumber: `2026-서울강남-${String(1000 + idx)}`,
        businessPhoneNumber: `02-100${idx}-200${idx}`,
        businessAddress: `서울시 강남구 테헤란로 ${10 + idx}`,
        imageUrl: `https://picsum.photos/seed/codiit-store-${idx}/800/800`,
        imageKey: null,
      },
    });

    await prisma.storeAuditLog.create({
      data: {
        storeId: store.id,
        sellerId: store.sellerId,
        action: 'CREATED',
        before: null,
        after: {
          name: store.name,
          address: store.address,
          detailAddress: store.detailAddress,
          phoneNumber: store.phoneNumber,
        },
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
  for (const row of sizeDefs) {
    sizes.push(await prisma.size.create({ data: row }));
  }
  return sizes;
}

async function seedProducts(stores, categories, sizes) {
  const products = [];

  for (let s = 0; s < stores.length; s += 1) {
    for (let p = 0; p < PRODUCTS_PER_SELLER; p += 1) {
      const category = pick(categories, s + p);
      const discountRate = p % 4 === 0 ? 15 : p % 3 === 0 ? 10 : null;
      const price = 25000 + s * 6000 + p * 1300;
      const specRows = makeSizeSpecs(category.name, p);

      const stockValues = sizes.map((_, idx) =>
        p % 9 === 0
          ? 0
          : Math.max(0, 2 + ((s + p + idx) % 9)),
      );
      const isSoldOut = stockValues.every((qty) => qty === 0);

      const created = await prisma.product.create({
        data: {
          storeId: stores[s].id,
          categoryId: category.id,
          name: `[${category.name}] ${stores[s].name} 상품 ${p + 1}`,
          content: `${category.name} 카테고리 상품 상세 설명 ${p + 1}`,
          material: p % 2 === 0 ? '면 100%' : '폴리에스터',
          color: p % 2 === 0 ? 'Black' : 'Ivory',
          manufacturerName: `제조사 ${s + 1}`,
          manufactureCountry: '대한민국',
          manufactureDate: `2026-${String((p % 12) + 1).padStart(2, '0')}`,
          caution: '단독 세탁 권장',
          qualityGuaranteeStandard: '전자상거래법 기준',
          asManagerName: `A/S담당 ${s + 1}`,
          asPhoneNumber: `02-900${s}-100${p % 10}`,
          shippingFee: 3000,
          extraShippingFee: 3000,
          shippingCompany: '로켓배송',
          deliveryPeriod: '2~3일',
          returnExchangePolicy: '수령 후 7일 이내 가능',
          returnShippingFee: 3000,
          exchangeShippingFee: 6000,
          price,
          isSoldOut,
          imageUrl: `https://picsum.photos/seed/codiit-product-${s + 1}-${p + 1}/900/900`,
          imageKey: null,
          discountRate,
          discountStartTime: discountRate
            ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            : null,
          discountEndTime: discountRate
            ? new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
            : null,
          stocks: {
            create: sizes.map((size, idx) => ({
              sizeId: size.id,
              quantity: stockValues[idx],
            })),
          },
          sizeSpecs: {
            create: specRows,
          },
        },
      });

      products.push({
        ...created,
        sellerId: stores[s].sellerId,
      });
    }
  }

  return products;
}

async function seedFavoritesAndCarts(buyers, stores, products, sizes) {
  for (let b = 0; b < buyers.length; b += 1) {
    for (let i = 0; i < stores.length; i += 1) {
      if ((b + i) % 2 === 0) {
        await prisma.storeFavorite.create({
          data: {
            userId: buyers[b].id,
            storeId: stores[i].id,
          },
        });
      }
    }

    const cart = await prisma.cart.create({
      data: { buyerId: buyers[b].id },
    });

    for (let i = 0; i < 6; i += 1) {
      const product = pick(products, b * 3 + i);
      const size = pick(sizes, i);
      const stock = await prisma.productStock.findUnique({
        where: { productId_sizeId: { productId: product.id, sizeId: size.id } },
      });
      if (!stock || stock.quantity === 0) continue;

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          sizeId: size.id,
          quantity: Math.min(1 + (i % 3), stock.quantity),
        },
      });
    }
  }
}

async function seedOrdersPaymentsShippingsAndReviews(buyers, products, sizes) {
  for (let b = 0; b < buyers.length; b += 1) {
    for (let i = 0; i < ORDERS_PER_BUYER; i += 1) {
      const orderStatus =
        i % 5 === 0
          ? OrderStatus.WaitingPayment
          : i % 5 === 1
            ? OrderStatus.Canceled
            : OrderStatus.CompletedPayment;
      const createdAt = new Date(
        Date.now() - (b * ORDERS_PER_BUYER + i) * 18 * 60 * 60 * 1000,
      );

      const order = await prisma.order.create({
        data: {
          buyerId: buyers[b].id,
          status: orderStatus,
          buyerName: buyers[b].name,
          phoneNumber: `010-20${String(b).padStart(2, '0')}-${String(1200 + i)}`,
          address: `서울시 주문구 주문로 ${b + 1}-${i + 1}`,
          usedPoints: i % 2 === 0 ? i * 300 : 0,
          earnedPoints: orderStatus === OrderStatus.CompletedPayment ? 700 + i * 80 : 0,
          createdAt,
          updatedAt: createdAt,
        },
      });

      const itemCount = i % 2 === 0 ? 2 : 1;
      const orderItems = [];
      let totalPrice = 0;

      for (let k = 0; k < itemCount; k += 1) {
        const product = pick(products, b * ORDERS_PER_BUYER + i + k);
        const size = pick(sizes, i + k);
        const quantity = 1 + ((i + k) % 2);
        const unitPrice = Math.floor(
          product.price * (1 - (product.discountRate ?? 0) / 100),
        );
        totalPrice += unitPrice * quantity;

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
        orderItems.push(orderItem);
      }

      const paymentMethod = pick(
        [PaymentMethod.CREDIT_CARD, PaymentMethod.BANK_TRANSFER, PaymentMethod.MOBILE_PHONE],
        b + i,
      );
      const paymentStatus = getPaymentStatusFromOrder(orderStatus, b + i);

      await prisma.payment.create({
        data: {
          orderId: order.id,
          price: Math.max(0, totalPrice - (i % 2 === 0 ? i * 100 : 0)),
          status: paymentStatus,
          paymentMethod,
          cardNumber: paymentMethod === PaymentMethod.CREDIT_CARD ? '1234' : null,
          bankName: paymentMethod === PaymentMethod.BANK_TRANSFER ? '신한은행' : null,
          phoneNumber:
            paymentMethod === PaymentMethod.MOBILE_PHONE
              ? `010-9999-${String(2000 + i)}`
              : null,
          transactionId: `TX-${order.id.slice(0, 8)}-${i}`,
          createdAt,
          updatedAt: createdAt,
        },
      });

      const shippingStatus = getShippingStatusFromOrder(orderStatus, b + i);
      const timeline = shippingTimeline(createdAt);
      const shipping = await prisma.shipping.create({
        data: {
          orderId: order.id,
          status: shippingStatus,
          trackingNumber: randomTrackingNumber(b * 100 + i),
          carrier: '로켓배송',
          readyToShipAt: timeline.ready,
          inShippingAt:
            shippingStatus === ShippingStatus.InShipping || shippingStatus === ShippingStatus.Delivered
              ? timeline.shipping
              : null,
          deliveredAt:
            shippingStatus === ShippingStatus.Delivered ? timeline.delivered : null,
          createdAt,
          updatedAt: createdAt,
        },
      });

      await prisma.shippingHistory.create({
        data: {
          shippingId: shipping.id,
          status: 'ReadyToShip',
          description: '배송 준비중',
          location: '물류센터',
          createdAt: timeline.ready,
        },
      });

      if (shippingStatus === ShippingStatus.InShipping || shippingStatus === ShippingStatus.Delivered) {
        await prisma.shippingHistory.create({
          data: {
            shippingId: shipping.id,
            status: 'InShipping',
            description: '배송 출발',
            location: '배송 허브',
            createdAt: timeline.shipping,
          },
        });
      }
      if (shippingStatus === ShippingStatus.Delivered) {
        await prisma.shippingHistory.create({
          data: {
            shippingId: shipping.id,
            status: 'Delivered',
            description: '배송 완료',
            location: '고객 주소지',
            createdAt: timeline.delivered,
          },
        });
      }

      if (orderStatus === OrderStatus.CompletedPayment && paymentStatus === PaymentStatus.CompletedPayment) {
        const reviewTarget = orderItems[0];
        await prisma.review.create({
          data: {
            buyerId: buyers[b].id,
            productId: reviewTarget.productId,
            orderItemId: reviewTarget.id,
            rating: ((b + i) % 5) + 1,
            content: `실구매 리뷰 ${buyers[b].name} - 만족도 ${((b + i) % 5) + 1}점`,
          },
        });
      }
    }
  }
}

async function seedInquiriesAndAnswers(buyers, products) {
  for (let b = 0; b < buyers.length; b += 1) {
    for (let i = 0; i < INQUIRIES_PER_BUYER; i += 1) {
      const product = pick(products, b * INQUIRIES_PER_BUYER + i);
      const completed = (b + i) % 2 === 0;

      const inquiry = await prisma.inquiry.create({
        data: {
          productId: product.id,
          buyerId: buyers[b].id,
          title: `[상품 문의] ${product.name} (${i + 1})`,
          content: `${product.name}의 상세 사이즈/배송 문의입니다.`,
          isSecret: i % 3 === 0,
          status: completed ? InquiryStatus.CompletedAnswer : InquiryStatus.WaitingAnswer,
        },
      });

      if (completed) {
        await prisma.inquiryAnswer.create({
          data: {
            inquiryId: inquiry.id,
            sellerId: product.sellerId,
            content: `문의 주신 내용에 대한 답변입니다. (${product.name})`,
          },
        });
      }
    }
  }
}

function cycleMessages(messages, count) {
  if (messages.length === 0) return [];
  return Array.from({ length: count }, (_, idx) => messages[idx % messages.length]);
}

async function seedNotifications(sellers, buyers, products) {
  if (!products[0]?.name) {
    throw new Error('seedNotifications requires at least one product');
  }

  for (const seller of sellers) {
    const inquiryRows = await prisma.inquiry.findMany({
      where: {
        product: {
          store: {
            sellerId: seller.id,
          },
        },
      },
      select: {
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: NOTIFICATIONS_PER_USER,
    });

    const soldOutRows = await prisma.product.findMany({
      where: {
        isSoldOut: true,
        store: {
          sellerId: seller.id,
        },
      },
      select: {
        name: true,
        stocks: {
          where: {
            quantity: 0,
          },
          select: {
            size: {
              select: { name: true },
            },
          },
          take: 1,
        },
      },
      take: NOTIFICATIONS_PER_USER,
    });

    const sellerMessages = [];
    for (const row of inquiryRows) {
      sellerMessages.push(
        `상품 "${row.product.name}"에 새로운 문의가 등록되었습니다.`,
      );
    }
    for (const row of soldOutRows) {
      const sizeName = row.stocks[0]?.size?.name;
      if (sizeName) {
        sellerMessages.push(
          `판매중인 상품 "${row.name}" (${sizeName}) 사이즈가 품절되었습니다.`,
        );
      }
      sellerMessages.push(
        `판매중인 상품 "${row.name}"의 모든 사이즈가 품절되었습니다.`,
      );
    }

    const sellerUniqueMessages = [...new Set(sellerMessages)];
    if (sellerUniqueMessages.length === 0) {
      continue;
    }
    const sellerFinalMessages = cycleMessages(
      sellerUniqueMessages,
      NOTIFICATIONS_PER_USER,
    );

    for (let i = 0; i < NOTIFICATIONS_PER_USER; i += 1) {
      await prisma.notification.create({
        data: {
          userId: seller.id,
          content: sellerFinalMessages[i],
          isChecked: i % 2 === 0,
        },
      });
    }
  }

  for (const buyer of buyers) {
    const answeredInquiryRows = await prisma.inquiry.findMany({
      where: {
        buyerId: buyer.id,
        status: InquiryStatus.CompletedAnswer,
      },
      select: {
        product: {
          select: { name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: NOTIFICATIONS_PER_USER,
    });

    const soldOutOrderRows = await prisma.orderItem.findMany({
      where: {
        order: {
          buyerId: buyer.id,
        },
        product: {
          isSoldOut: true,
        },
      },
      select: {
        productName: true,
        size: {
          select: { name: true },
        },
      },
      take: NOTIFICATIONS_PER_USER,
    });

    const soldOutCartRows = await prisma.cartItem.findMany({
      where: {
        cart: {
          buyerId: buyer.id,
        },
        product: {
          isSoldOut: true,
        },
      },
      select: {
        product: {
          select: { name: true },
        },
        size: {
          select: { name: true },
        },
      },
      take: NOTIFICATIONS_PER_USER,
    });

    const buyerMessages = [];
    for (const row of answeredInquiryRows) {
      buyerMessages.push(
        `문의하신 상품 "${row.product.name}"에 답변이 등록되었습니다.`,
      );
    }
    for (const row of soldOutOrderRows) {
      buyerMessages.push(
        `장바구니/주문 상품 "${row.productName}" (${row.size.name})이(가) 품절되었습니다.`,
      );
    }
    for (const row of soldOutCartRows) {
      buyerMessages.push(
        `장바구니/주문 상품 "${row.product.name}" (${row.size.name})이(가) 품절되었습니다.`,
      );
    }

    const buyerUniqueMessages = [...new Set(buyerMessages)];
    if (buyerUniqueMessages.length === 0) {
      continue;
    }
    const buyerFinalMessages = cycleMessages(
      buyerUniqueMessages,
      NOTIFICATIONS_PER_USER,
    );

    for (let i = 0; i < NOTIFICATIONS_PER_USER; i += 1) {
      await prisma.notification.create({
        data: {
          userId: buyer.id,
          content: buyerFinalMessages[i],
          isChecked: i % 3 === 0,
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

  await seedFavoritesAndCarts(buyers, stores, products, sizes);
  await seedOrdersPaymentsShippingsAndReviews(buyers, products, sizes);
  await seedInquiriesAndAnswers(buyers, products);
  await seedNotifications(sellers, buyers, products);

  console.log('Mock seed completed');
  console.log(
    `Sellers: ${sellers.length}, Buyers: ${buyers.length}, Stores: ${stores.length}`,
  );
  console.log(
    `Products: ${products.length}, Categories: ${categories.length}, Sizes: ${sizes.length}`,
  );
  console.log(`Login accounts (password: ${DEFAULT_PASSWORD})`);
  for (let i = 1; i <= SELLER_COUNT; i += 1) {
    console.log(`- seller${i}@codiit.com`);
  }
  for (let i = 1; i <= BUYER_COUNT; i += 1) {
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
