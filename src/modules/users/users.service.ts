import { usersRepository } from './users.repository';
import { hashPassword } from '../../lib/constants/password';
import { CreateUserDto } from './dto/create-user.dto';
import { LikeStoreResponseDto } from './dto/like-store-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { toLikeStoreResponse, toUserResponse } from './utils/users.mapper';
import { s3Service } from '../s3/s3.service';
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

    const created = await usersRepository.create({
      type: data.type ?? 'BUYER',
      name: data.name,
      email: data.email,
      passwordHash: hashPassword(data.password),
      gradeId: (await usersRepository.findLowestGrade())?.id,
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
    const user = await requireUserById(userId);
    ensureCurrentPassword(data.currentPassword, user.passwordHash);
    validateUpdatePassword(data.password);

    if (data.email && data.email !== user.email) {
      await ensureEmailAvailable(data.email);
    }

    const nextPasswordHash =
      data.password !== undefined ? hashPassword(data.password) : undefined;
    const uploadedImage = image ? await s3Service.uploadFile(image) : null;

    const updated = await usersRepository.updateById(
      userId,
      toUserUpdateData(
        data,
        uploadedImage?.url,
        nextPasswordHash,
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
}

export const usersService = new UsersService();
