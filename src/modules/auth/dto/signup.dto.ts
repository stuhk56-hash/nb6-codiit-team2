/*2026-03-23*/
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';
import { USER_CONSTANTS } from '../../users/constants/user.constant';

export class SignUpDto {
  @IsString()
  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
  @MinLength(USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH, {
    message: `이름은 최소 ${USER_CONSTANTS.VALIDATION.NAME_MIN_LENGTH}자 이상이어야 합니다.`,
  })
  @MaxLength(USER_CONSTANTS.VALIDATION.NAME_MAX_LENGTH)
  name: string;

  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @MinLength(USER_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH, {
    message: `비밀번호는 최소 ${USER_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
  })
  @MaxLength(USER_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH)
  // 정규표현식 예시: 영문, 숫자, 특수문자 조합 강제 (피그마 보안 정책에 따라 조정 가능)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: '비밀번호는 대문자, 소문자, 숫자 또는 특수문자를 포함해야 합니다.',
  })
  password: string;

  @IsEnum(UserRole, {
    message: '유효하지 않은 유저 타입입니다. (BUYER 또는 SELLER만 가능)',
  })
  @IsNotEmpty({ message: '유저 타입(BUYER/SELLER) 선택은 필수입니다.' })
  type: UserRole;
}
