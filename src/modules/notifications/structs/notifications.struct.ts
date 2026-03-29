import * as s from 'superstruct';
import {
  nonEmptyString,
  optionalNumberFromUnknown,
} from '../../../lib/validation/struct-helpers';

export const NotificationsQueryStruct = s.type({
  page: optionalNumberFromUnknown,
  pageSize: optionalNumberFromUnknown,
  sort: s.optional(s.union([s.literal('oldest'), s.literal('recent')])),
  filter: s.optional(
    s.union([s.literal('all'), s.literal('unChecked'), s.literal('checked')]),
  ),
});

export const AlarmParamsStruct = s.type({
  alarmId: nonEmptyString,
});
