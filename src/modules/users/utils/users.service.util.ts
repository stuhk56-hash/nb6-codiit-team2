import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import { verifyPassword } from '../../../lib/constants/password';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { usersRepository } from '../users.repository';
import { UserUpdateData, UserWithGrade } from '../types/users.type';

export function validateCreateUserInput(data: CreateUserDto) {
  if (!data.name || !data.email || !data.password) {
    throw new BadRequestError('필수 입력값이 누락되었습니다.');
  }
  if (data.name.length < 2) {
    throw new BadRequestError('이름은 최소 2자 이상이어야 합니다.');
  }
  if (data.name.length > 10) {
    throw new BadRequestError('이름은 최대 10자까지 가능합니다.');
  }
  if (data.type && data.type !== 'SELLER' && data.type !== 'BUYER') {
    throw new BadRequestError('회원 유형이 올바르지 않습니다.');
  }
  if (data.password.length < 8) {
    throw new BadRequestError('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  if (data.password.length > 20) {
    throw new BadRequestError('비밀번호는 최대 20자까지 가능합니다.');
  }
}

export function validateUpdatePassword(password?: string) {
  if (password !== undefined && password.length < 8) {
    throw new BadRequestError('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  if (password !== undefined && password.length > 20) {
    throw new BadRequestError('비밀번호는 최대 20자까지 가능합니다.');
  }
}

export function ensureCurrentPassword(input?: string, passwordHash?: string) {
  if (!input || !passwordHash || !verifyPassword(input, passwordHash)) {
    throw new ForbiddenError('현재 비밀번호가 올바르지 않습니다.');
  }
}

export async function ensureEmailAvailable(email: string) {
  const existing = await usersRepository.findByEmail(email);
  if (existing) {
    throw new ConflictError('이미 존재하는 유저입니다.');
  }
}

export async function requireUserById(userId: string): Promise<UserWithGrade> {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('존재하지 않는 유저 입니다.');
  }

  return user;
}

export function toUserUpdateData(
  data: UpdateUserDto,
  imageUrl?: string,
  passwordHash?: string,
  imageKey?: string,
): UserUpdateData {
  return {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.email !== undefined ? { email: data.email } : {}),
    ...(passwordHash !== undefined ? { passwordHash } : {}),
    ...(imageUrl !== undefined ? { imageUrl } : {}),
    ...(imageKey !== undefined ? { imageKey } : {}),
  };
}
