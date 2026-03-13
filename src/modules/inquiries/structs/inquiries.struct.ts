import * as s from 'superstruct';
import {
  booleanFromUnknown,
  nonEmptyString,
  optionalNumberFromUnknown,
} from '../../../lib/validation/struct-helpers';

export const InquiriesQueryStruct = s.type({
  page: optionalNumberFromUnknown,
  pageSize: optionalNumberFromUnknown,
  status: s.optional(
    s.union([s.literal('WaitingAnswer'), s.literal('CompletedAnswer')]),
  ),
});

export const InquiryParamsStruct = s.type({
  inquiryId: nonEmptyString,
});

export const ReplyParamsStruct = s.type({
  replyId: nonEmptyString,
});

export const CreateInquiryBodyStruct = s.type({
  title: nonEmptyString,
  content: nonEmptyString,
  isSecret: s.optional(booleanFromUnknown),
});

export const UpdateInquiryBodyStruct = s.partial(
  s.type({
    title: nonEmptyString,
    content: nonEmptyString,
    isSecret: booleanFromUnknown,
  }),
);

export const CreateInquiryReplyBodyStruct = s.type({
  content: nonEmptyString,
});

export const UpdateInquiryReplyBodyStruct = s.partial(
  s.type({
    content: nonEmptyString,
  }),
);
