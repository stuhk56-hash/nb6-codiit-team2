import swaggerJsdoc from 'swagger-jsdoc';

// 1. 공통 정의 (Base Definition)
const commonDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Dear Carmate API',
        version: '1.0.0',
        description: '3조 Dear Carmate 프로젝트 API 문서입니다.',
    },
    servers: [
        {
            url: 'http://localhost:3001', // 환경에 맞게 수정 필요
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
    { name: '사용자(Users)', slug: 'users', paths: ['./src/modules/users/**/*-swagger.ts'] },
    { name: '차량(Cars)', slug: 'cars', paths: ['./src/modules/cars/**/*-swagger.ts'] },
    { name: '고객(Customers)', slug: 'customers', paths: ['./src/modules/customers/**/*-swagger.ts'] },
    { name: '계약(Contracts)', slug: 'contracts', paths: ['./src/modules/contracts/**/*-swagger.ts'] },
    { name: '계약서류(Documents)', slug: 'documents', paths: ['./src/modules/contractDocuments/**/*-swagger.ts'] },
    { name: '대시보드(Dashboards)', slug: 'dashboards', paths: ['./src/modules/dashboards/**/*-swagger.ts'] },
    { name: '회사(Companies)', slug: 'companies', paths: ['./src/modules/companies/**/*-swagger.ts'] },
    { name: '업로드(Uploads)', slug: 'uploads', paths: ['./src/modules/uploads/**/*-swagger.ts'] },
    { name: '공통(Common)', slug: 'common', paths: ['./src/modules/common/**/*-swagger.ts'] },
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
