import { createInquiriesRouter } from './inquiries.controller';
import { InquiriesRepository } from './inquiries.repository';
import { InquiriesService } from './inquiries.service';

export const inquiriesBasePath = '/api/inquiries';

export const createInquiriesModuleRouter = () => {
  const repository = new InquiriesRepository();
  const service = new InquiriesService(repository);
  return createInquiriesRouter(service);
};
