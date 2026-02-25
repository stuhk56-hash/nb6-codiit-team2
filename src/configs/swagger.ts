import swaggerJsdoc from 'swagger-jsdoc';

// 1. 공통 정의 (Base Definition)
const commonDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Codi-it API',
        version: '1.0.0',
        description: 'Codi-it project API docs.',
    },
    servers: [
        {
            url: 'http://localhost:3000', // Default port from .env
            description: 'Local Server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
};

// 2. 모듈별 설정 (Modules)
const modules = [
    { name: '전체(All)', slug: 'all', paths: ['./src/modules/**/*-swagger.ts'] },
    { name: '인증(Auth)', slug: 'auth', paths: ['./src/modules/auth/**/*-swagger.ts'] },
    { name: '장바구니(Cart)', slug: 'cart', paths: ['./src/modules/cart/**/*-swagger.ts'] },
    { name: '공통(Common)', slug: 'common', paths: ['./src/modules/common/**/*-swagger.ts'] },
    { name: '대시보드(Dashboard)', slug: 'dashboard', paths: ['./src/modules/dashboard/**/*-swagger.ts'] },
    { name: '문의(Inquiries)', slug: 'inquiries', paths: ['./src/modules/inquiries/**/*-swagger.ts'] },
    { name: '메타데이터(Metadata)', slug: 'metadata', paths: ['./src/modules/metadata/**/*-swagger.ts'] },
    { name: '알림(Notifications)', slug: 'notifications', paths: ['./src/modules/notifications/**/*-swagger.ts'] },
    { name: '주문(Orders)', slug: 'orders', paths: ['./src/modules/orders/**/*-swagger.ts'] },
    { name: '상품(Products)', slug: 'products', paths: ['./src/modules/products/**/*-swagger.ts'] },
    { name: '리뷰(Reviews)', slug: 'reviews', paths: ['./src/modules/reviews/**/*-swagger.ts'] },
    { name: 'S3', slug: 's3', paths: ['./src/modules/s3/**/*-swagger.ts'] },
    { name: '스토어(Stores)', slug: 'stores', paths: ['./src/modules/stores/**/*-swagger.ts'] },
    { name: '사용자(Users)', slug: 'users', paths: ['./src/modules/users/**/*-swagger.ts'] },
];

// 3. 스펙 생성 (Generate Specs)
// 배열 형태로 내보내어 app.ts에서 반복문으로 처리할 수 있게 함
export const specs = modules.map((module) => ({
    name: module.name,
    slug: module.slug,
    spec: swaggerJsdoc({
        definition: commonDefinition,
        apis: module.paths,
    }),
}));
