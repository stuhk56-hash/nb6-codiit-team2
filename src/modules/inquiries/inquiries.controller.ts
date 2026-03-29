import type { Response } from 'express';
import { create as structCreate } from 'superstruct';
import { requireAuthUser } from '../../lib/request/auth-user';
import type { AuthenticatedRequest } from '../../middlewares/authenticate';
import type { InquiriesQuery } from './types/inquiries.type';
import type { UpdateInquiryDto } from './dto/update-inquiry.dto';
import type { CreateInquiryReplyDto } from './dto/create-inquiry-reply.dto';
import type { UpdateInquiryReplyDto } from './dto/update-inquiry-reply.dto';
import { inquiriesService } from './inquiries.service';
import {
  CreateInquiryReplyBodyStruct,
  InquiriesQueryStruct,
  InquiryParamsStruct,
  ReplyParamsStruct,
  UpdateInquiryBodyStruct,
  UpdateInquiryReplyBodyStruct,
} from './structs/inquiries.struct';

export async function findMyInquiries(
  req: AuthenticatedRequest,
  res: Response,
) {
  const authUser = requireAuthUser(req);
  const query: InquiriesQuery = structCreate(req.query, InquiriesQueryStruct);
  const inquiries = await inquiriesService.findMyInquiries(authUser, query);
  res.send(inquiries);
}

export async function findOneInquiry(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, InquiryParamsStruct);
  const inquiry = await inquiriesService.findOneInquiry(
    authUser,
    params.inquiryId,
  );
  res.send(inquiry);
}

export async function updateInquiry(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, InquiryParamsStruct);
  const body: UpdateInquiryDto = structCreate(
    req.body,
    UpdateInquiryBodyStruct,
  );
  const inquiry = await inquiriesService.updateInquiry(
    authUser.id,
    params.inquiryId,
    body,
  );
  res.send(inquiry);
}

export async function deleteInquiry(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, InquiryParamsStruct);
  const inquiry = await inquiriesService.deleteInquiry(
    authUser,
    params.inquiryId,
  );
  res.send(inquiry);
}

export async function replyCreate(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, InquiryParamsStruct);
  const body: CreateInquiryReplyDto = structCreate(
    req.body,
    CreateInquiryReplyBodyStruct,
  );
  const reply = await inquiriesService.replyCreate(
    authUser.id,
    params.inquiryId,
    body,
  );
  res.status(201).send(reply);
}

export async function replyUpdate(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, ReplyParamsStruct);
  const body: UpdateInquiryReplyDto = structCreate(
    req.body,
    UpdateInquiryReplyBodyStruct,
  );
  const reply = await inquiriesService.replyUpdate(
    authUser.id,
    params.replyId,
    body,
  );
  res.send(reply);
}
