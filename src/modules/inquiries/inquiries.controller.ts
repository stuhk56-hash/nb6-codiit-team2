import { Router, type Request, type Response } from 'express';
import { assert, StructError, type Struct } from 'superstruct';
import { InquiryValidationError } from './inquiries.errors';
import asyncHandler from '../../errors/async-handler';
import type { CreateInquiryReplyDto } from './dto/create-inquiry-reply.dto';
import type { CreateInquiryDto } from './dto/create-inquiry.dto';
import type { InquiriesListQueryDto } from './dto/inquiries-list.dto';
import type { UpdateInquiryReplyDto } from './dto/update-inquiry-reply.dto';
import type { UpdateInquiryDto } from './dto/update-inquiry.dto';
import type { InquiriesService } from './inquiries.service';
import {
  createInquiryBodyStruct,
  createInquiryReplyBodyStruct,
  inquiriesListQueryStruct,
  inquiryIdParamStruct,
  replyIdParamStruct,
  updateInquiryBodyStruct,
  updateInquiryReplyBodyStruct,
} from './structs/inquiries.struct';

type InquiryIdParams = { inquiryId: string };
type ReplyIdParams = { replyId: string };

function validateByStruct<T>(value: unknown, struct: Struct<T, any>) {
  try {
    assert(value, struct);
    return value as T;
  } catch (error) {
    if (error instanceof StructError) {
      throw new InquiryValidationError(error.message);
    }

    throw error;
  }
}

export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  createRouter() {
    const router = Router();

    router.post(
      '/',
      asyncHandler(async (req: Request, res: Response) => {
        const body = validateByStruct<CreateInquiryDto>(req.body, createInquiryBodyStruct);
        const response = await this.inquiriesService.createInquiry(req.user, body);
        res.status(201).json(response);
      }),
    );

    router.get(
      '/',
      asyncHandler(async (req: Request, res: Response) => {
        const query = validateByStruct<InquiriesListQueryDto>(
          req.query,
          inquiriesListQueryStruct,
        );
        const response = await this.inquiriesService.getMyInquiries(req.user, query);
        res.status(200).json(response);
      }),
    );

    router.get(
      '/:inquiryId',
      asyncHandler(async (req: Request, res: Response) => {
        const { inquiryId } = validateByStruct<InquiryIdParams>(req.params, inquiryIdParamStruct);
        const response = await this.inquiriesService.getInquiryDetail(req.user, inquiryId);
        res.status(200).json(response);
      }),
    );

    router.patch(
      '/:inquiryId',
      asyncHandler(async (req: Request, res: Response) => {
        const { inquiryId } = validateByStruct<InquiryIdParams>(req.params, inquiryIdParamStruct);
        const body = validateByStruct<UpdateInquiryDto>(req.body, updateInquiryBodyStruct);
        const response = await this.inquiriesService.updateInquiry(req.user, inquiryId, body);
        res.status(200).json(response);
      }),
    );

    router.delete(
      '/:inquiryId',
      asyncHandler(async (req: Request, res: Response) => {
        const { inquiryId } = validateByStruct<InquiryIdParams>(req.params, inquiryIdParamStruct);
        const response = await this.inquiriesService.deleteInquiry(req.user, inquiryId);
        res.status(200).json(response);
      }),
    );

    router.post(
      '/:inquiryId/replies',
      asyncHandler(async (req: Request, res: Response) => {
        const { inquiryId } = validateByStruct<InquiryIdParams>(req.params, inquiryIdParamStruct);
        const body = validateByStruct<CreateInquiryReplyDto>(
          req.body,
          createInquiryReplyBodyStruct,
        );
        const response = await this.inquiriesService.createReply(req.user, inquiryId, body);
        res.status(201).json(response);
      }),
    );

    router.patch(
      '/:replyId/replies',
      asyncHandler(async (req: Request, res: Response) => {
        const { replyId } = validateByStruct<ReplyIdParams>(req.params, replyIdParamStruct);
        const body = validateByStruct<UpdateInquiryReplyDto>(
          req.body,
          updateInquiryReplyBodyStruct,
        );
        const response = await this.inquiriesService.updateReply(req.user, replyId, body);
        res.status(200).json(response);
      }),
    );

    router.delete(
      '/:replyId/replies',
      asyncHandler(async (req: Request, res: Response) => {
        const { replyId } = validateByStruct<ReplyIdParams>(req.params, replyIdParamStruct);
        const response = await this.inquiriesService.deleteReply(req.user, replyId);
        res.status(200).json(response);
      }),
    );

    return router;
  }
}

export function createInquiriesRouter(inquiriesService: InquiriesService) {
  return new InquiriesController(inquiriesService).createRouter();
}
