
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '김유저',
    description: '이름',
    required: false,
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'password',
    description: '변경할 비밀번호',
    required: false,
  })
  password?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'current password',
    description: '현재 비밀번호',
    required: true,
  })
  currentPassword!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'https://example.com/new-profile.jpg',
    description: 'S3 URL로 변환될 프로필 이미지 파일',
    required: false,
  })
  image?: string;
}
