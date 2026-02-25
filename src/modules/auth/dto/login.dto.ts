<<<<<<< HEAD
=======
/* 2026-02-25 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    example: 'buyer@codiit.com',
    description: 'User email address',
    required: true,
  })
  email!: string;

  @IsString()
  @ApiProperty({
    example: 'test1234',
    description: 'User password',
    required: true,
  })
  password!: string;
}
>>>>>>> Auth-Edky
