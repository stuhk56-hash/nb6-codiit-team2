import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class UserEntity {
  @ApiProperty({
    description: '유저 KEY ID',
    type: String,
    example: 'clxkjdo1a00001234abcd5678',
  })
  id: string;

  @ApiProperty({
    description: '유저 타입',
    enum: UserType,
    example: UserType.BUYER,
  })
  type: UserType;

  @ApiProperty({
    description: '유저 이메일',
    type: String,
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '유저 이름',
    type: String,
    example: '김유저',
  })
  name: string;

  /**
   * 비밀번호 해시값 (API 응답에 포함되지 않아야 함)
   */
  passwordHash: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    type: String,
    nullable: true,
    example: 'https://example.com/profile.jpg',
  })
  imageUrl: string | null;

  /**
   * 이미지 저장소 키 (API 응답에 포함되지 않아야 함)
   */
  imageKey: string | null;

  @ApiProperty({
    description: '보유 포인트',
    type: Number,
    example: 0,
  })
  points: number;

  @ApiProperty({
    description: '현재 등급 ID (nullable)',
    type: String,
    nullable: true,
    example: 'grade_green',
  })
  gradeId: string | null;

  @ApiProperty({
    description: '생성 시각',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 시각',
    type: Date,
  })
  updatedAt: Date;
}
