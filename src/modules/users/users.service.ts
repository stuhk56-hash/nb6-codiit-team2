import { usersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LikeStoreResponseDto } from './dto/like-store-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { toLikeStoreResponse, toUserResponse } from './utils/users.mapper';
import {
  ensureCurrentPassword,
  ensureEmailAvailable,
  requireUserById,
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
      passwordHash: data.password,
      gradeId: (await usersRepository.findLowestGrade())?.id,
    });

    return toUserResponse(created);
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await requireUserById(userId);
    return toUserResponse(user);
  }

  async updateMe(
    userId: string,
    data: UpdateUserDto,
    image?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const user = await requireUserById(userId);
    ensureCurrentPassword(data.currentPassword, user.passwordHash);
    validateUpdatePassword(data.password);

    const imageUrl = image ? undefined : undefined;
    const updated = await usersRepository.updateById(
      userId,
      toUserUpdateData(data, imageUrl),
    );

    return toUserResponse(updated);
  }

  async deleteUser(userId: string) {
    await requireUserById(userId);
    await usersRepository.deleteById(userId);
  }

  async getLikedStores(userId: string): Promise<LikeStoreResponseDto[]> {
    await requireUserById(userId);
    const likes = await usersRepository.findLikedStores(userId);
    return likes.map((favorite) => toLikeStoreResponse(favorite));
  }
}

export const usersService = new UsersService();
