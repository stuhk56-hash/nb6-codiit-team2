import { PartialType } from '@nestjs/mapped-types';
import { CreateGradeDto } from './create-grade.dto';
import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsHexColor,
  IsString,
} from 'class-validator';

/**
 * 기존 등급(Grade) 정보를 수정할 때 사용하는 데이터 전송 객체입니다.
 * CreateGradeDto의 모든 필드를 '선택적(Optional)'으로 상속받습니다.
 */
export class UpdateGradeDto extends PartialType(CreateGradeDto) {
  // PartialType을 상속받으면 모든 필드에 자동으로 @IsOptional()이 적용됩니다.

  // 만약 특정 필드에 대해 수정 시 추가적인 제약 조건이 필요하다면 아래와 같이 재정의할 수 있습니다.

  @IsOptional()
  @IsInt({ message: '적립률은 정수여야 합니다.' })
  @Min(0)
  @Max(100)
  rate?: number;

  @IsOptional()
  @IsHexColor({ message: '올바른 컬러 코드 형식이어야 합니다.' })
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minAmount?: number;
}
