import { ApiProperty } from '@nestjs/swagger';

class StoreInLikeResponseDto {
  @ApiProperty({
    example: 'clys5l0s0000008l4beha6g8f',
    description: '스토어 ID',
  })
  id!: string;

  @ApiProperty({
    example: 'CODI-IT',
    description: '스토어 이름',
  })
  name!: string;

  @ApiProperty({
    example: '2025-06-01T12:00:00.000Z',
    description: '스토어 생성일',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2025-06-01T13:00:00.000Z',
    description: '스토어 정보 업데이트일',
  })
  updatedAt!: string;

  @ApiProperty({
    example: 'clrs5l0s1000108l4fkan1x0r',
    description: '스토어 소유자 유저 ID',
  })
  userId!: string;

  @ApiProperty({
    example: '서울특별시 강남구 테헤란로 123',
    description: '주소',
  })
  address!: string;

  @ApiProperty({
    example: '1동 1106호',
    description: '상세 주소',
  })
  detailAddress!: string;

  @ApiProperty({
    example: '010-1234-5678',
    description: '전화번호',
  })
  phoneNumber!: string;

  @ApiProperty({
    example: '저희는 CODI-IT 입니다.',
    description: '스토어 설명',
  })
  content!: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: '가게 이미지 URL',
  })
  image!: string;
}

export class LikeStoreResponseDto {
  @ApiProperty({
    example: 'clrs5l0s0000008l4beha6g8f',
    description: '스토어 ID',
  })
  storeId!: string;

  @ApiProperty({
    example: 'clrs5l0s1000108l4fkan1x0r',
    description: '유저 ID',
  })
  userId!: string;

  @ApiProperty({
    description: '가게 정보',
    type: () => StoreInLikeResponseDto,
  })
  store!: StoreInLikeResponseDto;
}
