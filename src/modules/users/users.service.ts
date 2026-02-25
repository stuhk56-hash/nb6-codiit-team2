import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './dto/user-response.dto';
import { Express } from 'express';

@Injectable()
export class UsersService {
  async create(dto: CreateUserDto): Promise<UserResponse> {
    // 1. 유저 중복 체크 로직 (예시)
    const isExist = await this.userRepository.findByEmail(dto.email);
    if (isExist) {
      throw new ConflictException('이미 존재하는 유저입니다.');
    }

    // 2. 유저 생성 및 기본값 세팅
    const newUser = {
      id: 'generated-cuid', // 실제로는 DB에서 생성
      ...dto,
      points: 0,
      image:
        'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/1749477485230-user_default.png',
      createdAt: new Date(),
      updatedAt: new Date(),
      grade: null,
    };

    return newUser;
  }

  async update(
    userId: string,
    dto: UpdateUserDto,
    file: Express.Multer.File,
  ): Promise<UserResponse> {
    // Mock implementation for updating a user
    const updatedUser: UserResponse = {
      id: userId,
      name: dto.name || '김유저',
      email: 'user01@example.com', // email is not updatable in this method
      type: 'BUYER',
      points: 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      grade: null,
      image: file
        ? `path/to/${file.originalname}`
        : 'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/1749477485230-user_default.png',
    };

    return updatedUser;
  }
}
