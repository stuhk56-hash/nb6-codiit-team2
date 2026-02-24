
import { ApiProperty } from '@nestjs/swagger';

export class UserConflictDto {
  @ApiProperty({
    example: '이미 존재하는 유저입니다.',
    description: '에러 메시지',
  })
  message!: string;

  @ApiProperty({
    example: 409,
    description: 'HTTP 상태 코드',
  })
  statusCode!: number;

  @ApiProperty({
    example: 'Conflict',
    description: '에러 타입',
  })
  error!: string;
}
