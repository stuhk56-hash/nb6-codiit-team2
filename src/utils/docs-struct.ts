import * as s from 'superstruct';


// 문자열이 들어오면 숫자로 변환해주는 커스텀 구조체
const CoercedNumber = s.coerce(s.number(), s.union([s.number(), s.string()]), (value) =>
    typeof value === 'string' ? parseInt(value, 10) : value
);

// 날짜 문자열을 Date 객체로 변환
const CoercedDate = s.coerce(s.date(), s.string(), (value) => new Date(value));

export const GetDocsListParams = s.object({
    page: s.defaulted(CoercedNumber, 1),
    pageSize: s.defaulted(CoercedNumber, 10),
    searchBy: s.optional(s.enums(['contractName', 'userName'])),
    keyword: s.optional(s.string()),
});