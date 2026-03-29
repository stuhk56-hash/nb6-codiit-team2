import * as s from 'superstruct';

//사용하실 분들은 참고해서 사용하시면 좋을 것 같습니다.
export const nonEmptyString = s.size(s.string(), 1, Infinity);
export const emailString = s.pattern(s.string(), /^[^\s@]+@[^\s@]+\.[^\s@]+$/);

export const numberFromUnknown = s.coerce(
  s.number(),
  s.union([s.number(), s.string()]),
  (value) => {
    if (typeof value === 'string') return Number(value);
    return value;
  },
);

export const optionalNumberFromUnknown = s.optional(numberFromUnknown);
export const positiveNumberFromUnknown = s.min(numberFromUnknown, 1);
export const nonNegativeNumberFromUnknown = s.min(numberFromUnknown, 0);

export const booleanFromUnknown = s.coerce(
  s.boolean(),
  s.union([s.boolean(), s.string()]),
  (value) => {
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }
    return value;
  },
);
