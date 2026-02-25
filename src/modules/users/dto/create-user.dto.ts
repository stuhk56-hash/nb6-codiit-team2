
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '김유저',
    description: '이름',
    required: true,
  })
  name!: string;

  @IsEmail()
  @ApiProperty({
    example: 'user01@example.com',
    description: '이메일',
    required: true,
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'password123',
    description: '비밀번호',
    required: true,
  })
  password!: string;

  @IsEnum(Role)
  @IsOptional()
  @ApiProperty({
    example: 'BUYER',
    description: '유저 타입',
    default: 'BUYER',
    enum: [Role.BUYER, Role.SELLER],
    required: false,
  })
  role?: Role = Role.BUYER;
}
