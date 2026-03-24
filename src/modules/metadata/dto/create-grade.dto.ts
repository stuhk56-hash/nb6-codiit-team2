import {
  IsEnum,
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { UserGradeId, UserGradeName } from '../../users/enums/user-grade.enum';

/**
 * 새로운 등급(Grade) 정보를 생성할 때 사용하는 데이터 전송 객체입니다.
 */
export class CreateGradeDto {
  @IsEnum(UserGradeId, {
    message: '올바른 등급 ID 형식이 아닙니다. (예: grade_green)',
  })
  @IsNotEmpty({ message: '등급 ID는 필수입니다.' })
  id: UserGradeId;

  @IsEnum(UserGradeName, {
    message: '올바른 등급 이름이 아닙니다. (예: green)',
  })
  @IsNotEmpty({ message: '등급 이름은 필수입니다.' })
  name: UserGradeName;

  @IsInt({ message: '적립률은 정수여야 합니다.' })
  @Min(0, { message: '적립률은 0% 이상이어야 합니다.' })
  @Max(100, { message: '적립률은 100%를 초과할 수 없습니다.' })
  @IsNotEmpty({ message: '적립률(rate)은 필수입니다.' })
  rate: number;

  @IsInt({ message: '기준 금액은 정수여야 합니다.' })
  @Min(0, { message: '기준 금액은 0원 이상이어야 합니다.' })
  @IsNotEmpty({ message: '최소 주문 금액(minAmount)은 필수입니다.' })
  minAmount: number;

  @IsHexColor({
    message: '올바른 16진수 컬러 코드 형식이어야 합니다. (예: #FFFFFF)',
  })
  @IsString()
  @IsNotEmpty({ message: '등급 컬러값은 필수입니다.' })
  color: string;
}
