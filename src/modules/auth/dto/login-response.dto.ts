<<<<<<< HEAD
=======
/* 2026-02-25 */
import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../../users/dto/user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: '로그인한 유저 정보',
    type: UserResponse,
  })
  user: UserResponse;

  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}
>>>>>>> Auth-Edky
