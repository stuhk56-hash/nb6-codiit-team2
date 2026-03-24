import { hashPassword } from '../../lib/constants/password';
import { s3Service } from '../s3/s3.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { LikeStoreResponseDto } from './dto/like-store-response.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UserResponseDto } from './dto/user-response.dto';
import { usersRepository } from './users.repository';
import {
  toLikeStoreResponse,
  toUserResponse,
} from './utils/users.mapper';
import {
  ensureCurrentPassword,
  ensureEmailAvailable,
  requireUserById,
  resolveLikedStoreImages,
  resolveUserImage,
  toUserUpdateData,
  validateCreateUserInput,
  validateUpdatePassword,
} from './utils/users.service.util';

export class UsersService {
  async create(data: CreateUserDto): Promise<UserResponseDto> {
    validateCreateUserInput(data);
    await ensureEmailAvailable(data.email);

    const defaultGrade = await usersRepository.findLowestGrade();

    const created = await usersRepository.create({
      type: data.type ?? 'BUYER',
      name: data.name,
      email: data.email,
      passwordHash: hashPassword(data.password),
      ...(defaultGrade ? { gradeId: defaultGrade.id } : {}),
    });

    const resolvedUser = await resolveUserImage(created);
    return toUserResponse(resolvedUser);
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await requireUserById(userId);
    const resolvedUser = await resolveUserImage(user);
    return toUserResponse(resolvedUser);
  }

  async updateMe(
    userId: string,
    data: UpdateUserDto,
    image?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    validateUpdatePassword(data.password);

    const currentUser = await requireUserById(userId);
    ensureCurrentPassword(data.currentPassword, currentUser.passwordHash);

    if (data.email && data.email !== currentUser.email) {
      await ensureEmailAvailable(data.email);
    }

    const uploadedImage = image ? await s3Service.uploadFile(image) : null;
    const passwordHash = data.password
      ? hashPassword(data.password)
      : undefined;

    const updated = await usersRepository.updateById(
      userId,
      toUserUpdateData(
        data,
        uploadedImage?.url,
        passwordHash,
        uploadedImage?.key,
      ),
    );

    const resolvedUser = await resolveUserImage(updated);
    return toUserResponse(resolvedUser);
  }

  async deleteUser(userId: string): Promise<void> {
    await requireUserById(userId);
    await usersRepository.softDeleteById(userId);
  }

  async getLikedStores(userId: string): Promise<LikeStoreResponseDto[]> {
    await requireUserById(userId);
    const likes = await usersRepository.findLikedStores(userId);
    const resolvedLikes = await resolveLikedStoreImages(likes);
    return resolvedLikes.map(toLikeStoreResponse);
  }

  async signUp(data: CreateUserDto): Promise<UserResponseDto> {
    return this.create(data);
  }

  async getMyProfile(userId: string): Promise<UserResponseDto> {
    return this.getMe(userId);
  }
}

export const usersService = new UsersService();
