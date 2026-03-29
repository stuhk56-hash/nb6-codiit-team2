import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  deleteInquiry,
  findMyInquiries,
  findOneInquiry,
  replyCreate,
  replyUpdate,
  updateInquiry,
} from './inquiries.controller';

export const inquiriesRouter = Router();

inquiriesRouter.get('/', authenticate(), withAsync(findMyInquiries));
inquiriesRouter.get('/:inquiryId', authenticate(), withAsync(findOneInquiry));
inquiriesRouter.patch('/:inquiryId', authenticate(), withAsync(updateInquiry));
inquiriesRouter.delete('/:inquiryId', authenticate(), withAsync(deleteInquiry));
inquiriesRouter.post(
  '/:inquiryId/replies',
  authenticate(),
  withAsync(replyCreate),
);
inquiriesRouter.patch(
  '/:replyId/replies',
  authenticate(),
  withAsync(replyUpdate),
);
