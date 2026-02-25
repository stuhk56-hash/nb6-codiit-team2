
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

class GradeInUserResponseDto {
  @ApiProperty({
    description: '등급 ID',
    example: 'grade_green',
  })
  id!: string;

  @ApiProperty({
    description: '등급 이름',
    example: 'green',
  })
  name!: string;

  @ApiProperty({
    description: '할인 율',
    example: 5,
  })
  rate!: number;

  @ApiProperty({
    description: '달성 최소 금액',
    example: 1000000,
  })
  minAmount!: number;
}

export class UserResponseDto {
  @ApiProperty({
    description: '유저 KEY ID',
    example: 'clwxaing3000008l4gtp3enfv',
  })
  id!: string;

  @ApiProperty({
    description: '유저 이름',
    example: '김유저',
  })
  name!: string;

  @ApiProperty({
    description: '유저 이메일',
    example: 'email@example.com',
  })
  email!: string;

  @ApiProperty({
    description: '유저 타입',
    example: 'BUYER',
    enum: [Role.BUYER, Role.SELLER],
  })
  role!: Role;

  @ApiProperty({
    description: '유저 포인트',
    example: 999,
  })
  points!: number;

  @ApiProperty({
    description: '유저 생성일',
    example: '2025-05-29T06:00:41.976Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: '유저 정보 업데이트일',
    example: '2025-05-29T06:00:41.976Z',
  })
  updatedAt!: string;

  @ApiProperty({
    description: '등급 정보 (nullable)',
    type: () => GradeInUserResponseDto,
    nullable: true,
  })
  grade!: GradeInUserResponseDto | null;

  @ApiProperty({
    description: '유저 프로필 이미지',
    example:
      'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/1749477485230-user_default.png',
  })
  image!: string;
}
