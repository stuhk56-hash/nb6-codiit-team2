/* 2026-02-25 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';
import { UserResponse } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = dto;

    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // NOTE: This is a simplified mapping. In a real application,
    // you would fetch related entities like 'grade' if they are needed in the response.
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
      points: user.points,
      image: user.imageUrl,
      grade: null, // Fetch grade info if necessary
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const payload = { email: user.email, sub: user.id, type: user.type };
    const accessToken = this.jwtService.sign(payload);

    // TODO: Implement Refresh Token generation and storage
    // const refreshToken = ...;

    return {
      user: userResponse,
      accessToken,
    };
  }
}
