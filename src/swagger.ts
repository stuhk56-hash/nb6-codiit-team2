import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CODI-IT',
      version: '1.0.0',
      description: 'CODI-IT API 명세입니다.',
    },
    servers: [
      {
        url: 'https://codiit.shop',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server',
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
      schemas: {
        ErrorBadRequest: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: '잘못된 요청입니다.' },
            error: { type: 'string', example: 'Bad Request' },
          },
        },
        ErrorUnauthorized: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 401 },
            message: { type: 'string', example: '인증이 필요합니다.' },
            error: { type: 'string', example: 'Unauthorized' },
          },
        },
        ErrorForbidden: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 403 },
            message: { type: 'string', example: '접근 권한이 없습니다.' },
            error: { type: 'string', example: 'Forbidden' },
          },
        },
        ErrorNotFound: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 404 },
            message: {
              type: 'string',
              example: '요청한 리소스를 찾을 수 없습니다.',
            },
            error: { type: 'string', example: 'Not Found' },
          },
        },
        ErrorConflict: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 409 },
            message: { type: 'string', example: '이미 존재하는 유저입니다.' },
            error: { type: 'string', example: 'ConFlict' },
          },
        },
        GradeResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'grade_green' },
            name: { type: 'string', example: 'green' },
            rate: { type: 'number', example: 5 },
            minAmount: { type: 'number', example: 1000000 },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'CUID' },
            name: { type: 'string', example: '김유저' },
            email: { type: 'string', example: 'email@example.com' },
            type: { type: 'string', example: 'BUYER' },
            points: { type: 'number', example: 999 },
            createdAt: {
              type: 'string',
              example: '2025-05-29T06:00:41.976Z',
            },
            updatedAt: {
              type: 'string',
              example: '2025-05-29T06:00:41.976Z',
            },
            grade: { $ref: '#/components/schemas/GradeResponse' },
            image: {
              type: 'string',
              example:
                'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/1749477485230-user_default.png',
            },
          },
        },
        StoreResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'CUID' },
            name: { type: 'string', example: 'CODI-IT' },
            createdAt: {
              type: 'string',
              example: '2025-06-01T12:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              example: '2025-06-01T13:00:00.000Z',
            },
            userId: { type: 'string', example: 'CUID' },
            address: {
              type: 'string',
              example: '서울특별시 강남구 테헤란로 123',
            },
            detailAddress: { type: 'string', example: '1동 1106호' },
            phoneNumber: { type: 'string', example: '010-1234-5678' },
            content: {
              type: 'string',
              example: '저희는 CODI-IT 입니다.',
            },
            image: {
              type: 'string',
              example: 'https://example.com/image.jpg',
            },
          },
        },
        InquiryReply: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'CUID' },
            content: {
              type: 'string',
              example: '이 제품은 재입고 예정입니다.',
            },
            createdAt: {
              type: 'string',
              example: '2024-06-01T12:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              example: '2024-06-01T12:00:00.000Z',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'abc123' },
                name: { type: 'string', example: '홍길동' },
              },
            },
          },
        },
        InquiryResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'CUID' },
            userId: { type: 'string', example: 'CUID' },
            productId: { type: 'string', example: 'CUID' },
            title: { type: 'string', example: '상품 문의' },
            content: { type: 'string', example: '문의 내용입니다.' },
            status: { type: 'string', example: 'CompletedAnswer' },
            isSecret: { type: 'boolean', example: false },
            createdAt: {
              type: 'string',
              example: '2023-10-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              example: '2023-10-01T00:00:00.000Z',
            },
            reply: { $ref: '#/components/schemas/InquiryReply' },
          },
        },
        InquiryReplyResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'CUID' },
            inquiryId: { type: 'string', example: 'CUID' },
            userId: { type: 'string', example: 'CUID' },
            content: {
              type: 'string',
              example: '이 제품은 재입고 예정입니다.',
            },
            createdAt: {
              type: 'string',
              example: '2024-06-01T12:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              example: '2024-06-01T12:00:00.000Z',
            },
          },
        },
        PaymentDto: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'CUID' },
            price: { type: 'number', example: 30000 },
            status: { type: 'string', example: 'CompletedPayment' },
            createdAt: {
              type: 'string',
              example: '2026-03-23T03:16:40.198Z',
            },
            updatedAt: {
              type: 'string',
              example: '2026-03-23T03:16:40.198Z',
            },
            orderId: { type: 'string', example: 'CUID' },
          },
        },
        OrderItemDto: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            price: { type: 'number' },
            quantity: { type: 'number' },
            productId: { type: 'string' },
            product: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                image: { type: 'string' },
                reviews: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      rating: { type: 'number' },
                      content: { type: 'string' },
                      createdAt: { type: 'string' },
                    },
                  },
                },
              },
            },
            size: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                size: {
                  type: 'object',
                  properties: {
                    en: { type: 'string' },
                    ko: { type: 'string' },
                  },
                },
              },
            },
            isReviewed: { type: 'boolean' },
          },
        },
        OrderResponseDto: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            phoneNumber: { type: 'string' },
            address: { type: 'string' },
            subtotal: { type: 'number' },
            totalQuantity: { type: 'number' },
            usePoint: { type: 'number' },
            createdAt: { type: 'string' },
            orderItems: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItemDto' },
            },
            payments: { $ref: '#/components/schemas/PaymentDto' },
          },
        },
        ReviewResponseDto: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            productId: { type: 'string' },
            orderItemId: { type: 'string' },
            rating: { type: 'number' },
            content: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
        AlarmDto: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'alarm_123' },
            userId: { type: 'string', example: 'user_456' },
            content: {
              type: 'string',
              example: '상품이 품절되었습니다.',
            },
            isChecked: { type: 'boolean', example: false },
            createdAt: {
              type: 'string',
              example: '2025-06-03T12:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              example: '2025-06-03T12:00:00.000Z',
            },
          },
        },
      },
    },
    tags: [
      { name: 'S3 (이미지 업로드)', description: 'S3 이미지 업로드 관련 API' },
      { name: 'Auth', description: '인증 관련 API' },
      { name: 'User', description: '사용자 관련 API' },
      { name: 'Product', description: '상품 관련 API' },
      { name: 'Store', description: '스토어 관련 API' },
      { name: 'Cart', description: '장바구니 관련 API' },
      { name: 'Orders', description: '주문 관련 API' },
      { name: 'Review', description: '리뷰 관련 API' },
      { name: 'Inquiry', description: '문의 관련 API' },
      { name: 'Dashboard', description: '대시보드 관련 API' },
      { name: 'Alarm', description: '알림 관련 API' },
      { name: 'Metadata', description: '메타데이터 관련 API' },
    ],
  },
  apis: ['./src/modules/**/*.module.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
