import { Router, type Request, type Response } from 'express';
import { assert, object, string, StructError, type Struct } from 'superstruct';
import asyncHandler from '../../errors/async-handler.js';
import { InquiryValidationError } from './inquiries.errors';
import {
  CreateInquiryReplyBodyStruct,
  type CreateInquiryReplyDto,
} from './dto/create-inquiry-reply.dto';
import { CreateInquiryBodyStruct, type CreateInquiryDto } from './dto/create-inquiry.dto';
import {
  InquiriesListQueryStruct,
  type InquiriesListQueryDto,
} from './dto/inquiries-list.dto';
import {
  UpdateInquiryReplyBodyStruct,
  type UpdateInquiryReplyDto,
} from './dto/update-inquiry-reply.dto';
import { UpdateInquiryBodyStruct, type UpdateInquiryDto } from './dto/update-inquiry.dto';
import type { InquiriesService } from './inquiries.service';

type RequestUser = {
  id: string | number;
  role?: 'BUYER' | 'SELLER' | 'ADMIN';
};

type TypedRequest = Request & { user?: RequestUser };

const IdParamStruct = object({
  inquiryId: string(),
});

const ReplyIdParamStruct = object({
  replyId: string(),
});

const validateStruct = <T>(value: unknown, struct: Struct<T, any>) => {
  try {
    // superstruct로 요청 데이터 형식을 검증
    assert(value, struct);
    return value as T;
  } catch (error) {
    if (error instanceof StructError) {
      throw new InquiryValidationError(error.message);
    }
    throw error;
  }
};

export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  createRouter() {
    const router = Router();

    router.post(
      '/',
      asyncHandler(async (req: TypedRequest, res: Response) => {
        // 문의 생성: body 검증 -> service 위임
        const body = validateStruct<CreateInquiryDto>(req.body, CreateInquiryBodyStruct);
        const result = await this.inquiriesService.createInquiry(req.user, body);
        res.status(201).json(result);
      }),
    );

    router.get(
      '/',
      asyncHandler(async (req: TypedRequest, res: Response) => {
        // 내 문의 목록 조회: 페이징/상태 필터 검증
        const query = validateStruct<InquiriesListQueryDto>(req.query, InquiriesListQueryStruct);
        const result = await this.inquiriesService.getMyInquiries(req.user, query);
        res.status(200).json(result);
      }),
    );

    router.get(
      '/:inquiryId',
      asyncHandler(async (req: TypedRequest, res: Response) => {
        // 문의 상세 조회
        const { inquiryId } = validateStruct<{ inquiryId: string }>(req.params, IdParamStruct);
        const result = await this.inquiriesService.getInquiryDetail(req.user, inquiryId);
        res.status(200).json(result);
      }),
    );

    router.patch(
      '/:inquiryId',
      asyncHandler(async (req: TypedRequest, res: Response) => {
        // 문의 수정
        const { inquiryId } = validateStruct<{ inquiryId: string }>(req.params, IdParamStruct);
        const body = validateStruct<UpdateInquiryDto>(req.body, UpdateInquiryBodyStruct);
        const result = await this.inquiriesService.updateInquiry(req.user, inquiryId, body);
        res.status(200).json(result);
      }),
    );

    router.delete(
      '/:inquiryId',
      asyncHandler(async (req: TypedRequest, res: Response) => {
        // 문의 삭제
        const { inquiryId } = validateStruct<{ inquiryId: string }>(req.params, IdParamStruct);
        const result = await this.inquiriesService.deleteInquiry(req.user, inquiryId);
        res.status(200).json(result);
      }),
    );

    router.post(
      '/:inquiryId/replies',
      asyncHandler(async (req: TypedRequest, res: Response) => {
        // 문의 답변 생성(판매자/관리자)
        const { inquiryId } = validateStruct<{ inquiryId: string }>(req.params, IdParamStruct);
        const body = validateStruct<CreateInquiryReplyDto>(
          req.body,
          CreateInquiryReplyBodyStruct,
        );
        const result = await this.inquiriesService.createReply(req.user, inquiryId, body);
        res.status(201).json(result);
      }),
    );

    router.patch(
      '/:replyId/replies',
      asyncHandler(async (req: TypedRequest, res: Response) => {
        // 문의 답변 수정(판매자/관리자)
        const { replyId } = validateStruct<{ replyId: string }>(req.params, ReplyIdParamStruct);
        const body = validateStruct<UpdateInquiryReplyDto>(
          req.body,
          UpdateInquiryReplyBodyStruct,
        );
        const result = await this.inquiriesService.updateReply(req.user, replyId, body);
        res.status(200).json(result);
      }),
    );

    // 답변 삭제 시 문의 상태를 WaitingAnswer로 복구
    router.delete(
      '/:replyId/replies',
      asyncHandler(async (req: TypedRequest, res: Response) => {
        const { replyId } = validateStruct<{ replyId: string }>(req.params, ReplyIdParamStruct);
        const result = await this.inquiriesService.deleteReply(req.user, replyId);
        res.status(200).json(result);
      }),
    );

    return router;
  }
}

export const createInquiriesRouter = (inquiriesService: InquiriesService) =>
  new InquiriesController(inquiriesService).createRouter();
