import { ApiProperty } from '@nestjs/swagger';

export class UserNotFoundDto {
  @ApiProperty({
    example: '유저를 찾을 수 없습니다.',
    description: '에러 메시지',
  })
  message!: string;

  @ApiProperty({
    example: 404,
    description: 'HTTP 상태 코드',
  })
  statusCode!: number;

  @ApiProperty({
    example: 'Not Found',
    description: '에러 타입',
  })
  error!: string;
}
