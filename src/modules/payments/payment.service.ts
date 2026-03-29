import { paymentRepository } from './payment.repository';
import * as paymentServiceUtil from './utils/payment.service.util';
import * as paymentUtil from './utils/payment.util';
import { toPaymentDto } from './utils/payment.mapper';
import { PaymentResponseDto, PaymentPaginatedResponseDto } from './dto/index';
import { BadRequestError, NotFoundError } from '../../lib/errors/customErrors';
import { PaymentMethod } from '@prisma/client';

export class PaymentService {
  async createPayment(
    orderId: string,
    price: number,
    paymentMethod: string,
    cardNumber?: string,
    bankName?: string,
    phoneNumber?: string,
  ): Promise<PaymentResponseDto> {
    if (!orderId || !price || !paymentMethod) {
      console.log('❌ 필수 정보 누락');
      throw new BadRequestError('필수 결제 정보가 누락되었습니다');
    }

    console.log('✅ 필수 정보 확인 통과');

    try {
      paymentServiceUtil.validatePaymentMethod(paymentMethod);
      console.log('✅ 결제 수단 검증 통과');

      paymentServiceUtil.validatePaymentAmount(price);
      console.log('✅ 결제 금액 검증 통과');

      const payment = await paymentRepository.createPayment(
        orderId,
        price,
        paymentMethod as PaymentMethod,
        cardNumber,
        bankName,
        phoneNumber,
      );
      console.log('✅ 결제 생성 완료');
      return toPaymentDto(payment);
    } catch (error) {
      console.log('❌ 에러 발생:', error);
      // 에러 메시지가 있으면 그것을, 없으면 기본 메시지 사용
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : '결제 생성 실패';
      throw new BadRequestError(errorMessage);
    }
  }

  async getPaymentByOrderId(
    buyerId: string,
    orderId: string,
  ): Promise<PaymentResponseDto> {
    if (!orderId) {
      throw new BadRequestError('주문 ID가 필요합니다');
    }

    const payment = await paymentRepository.findPaymentByOrderId(orderId);

    if (!payment) {
      throw new NotFoundError('결제 정보를 찾을 수 없습니다');
    }

    if (payment.order.buyerId !== buyerId) {
      throw new BadRequestError('접근 권한이 없습니다');
    }

    return toPaymentDto(payment);
  }

  async getPaymentById(
    buyerId: string,
    paymentId: string,
  ): Promise<PaymentResponseDto> {
    if (!paymentId) {
      throw new BadRequestError('결제 ID가 필요합니다');
    }

    const payment = await paymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new NotFoundError('결제 정보를 찾을 수 없습니다');
    }

    if (payment.order.buyerId !== buyerId) {
      throw new BadRequestError('접근 권한이 없습니다');
    }

    return toPaymentDto(payment);
  }

  async getPaymentsByUserId(
    buyerId: string,
    limit: number = 10,
    page: number = 1,
    status?: string,
  ): Promise<PaymentPaginatedResponseDto> {
    if (page < 1 || limit < 1) {
      throw new BadRequestError('잘못된 입력값입니다');
    }

    const { payments, total } = await paymentRepository.findPaymentsByUserId(
      buyerId,
      limit,
      page,
      status,
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: payments.map(toPaymentDto),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getPaymentsByStatus(status: string): Promise<PaymentResponseDto[]> {
    if (!status) {
      throw new BadRequestError('상태 파라미터가 필요합니다');
    }

    const payments = await paymentRepository.findPaymentsByStatus(status);
    return payments.map(toPaymentDto);
  }

  async cancelPayment(
    buyerId: string,
    orderId: string,
  ): Promise<PaymentResponseDto> {
    if (!orderId) {
      throw new BadRequestError('주문 ID가 필요합니다');
    }

    const payment = await paymentRepository.findPaymentByOrderId(orderId);

    if (!payment) {
      throw new NotFoundError('결제 정보를 찾을 수 없습니다');
    }

    if (payment.order.buyerId !== buyerId) {
      throw new BadRequestError('접근 권한이 없습니다');
    }

    if (!paymentUtil.isPaymentCancellable(payment.status)) {
      throw new BadRequestError('취소할 수 없는 결제입니다');
    }

    try {
      const canceledPayment =
        await paymentRepository.cancelPaymentWithTransaction(orderId);
      return toPaymentDto(canceledPayment);
    } catch (error) {
      // 에러 메시지가 있으면 그것을, 없으면 기본 메시지 사용
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : '결제 취소 실패';
      throw new BadRequestError(errorMessage);
    }
  }
}

export const paymentService = new PaymentService();
