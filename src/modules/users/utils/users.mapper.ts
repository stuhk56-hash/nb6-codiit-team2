import { LikeStoreResponseDto } from '../dto/like-store-response.dto';
import { UserGradeDto, UserResponseDto } from '../dto/user-response.dto';
import { StoreFavoriteWithStore, UserWithGrade } from '../types/users.type';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';

function toGradeResponse(
  grade: UserWithGrade['grade'],
): UserGradeDto | null {
  if (!grade) {
    return null;
  }

  return {
    name: grade.name,
    id: grade.id,
    rate: grade.rate,
    minAmount: grade.minAmount,
  };
}

export async function toUserResponse(user: UserWithGrade): Promise<UserResponseDto> {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.type,
    points: user.points,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    grade: toGradeResponse(user.grade),
    image: await resolveS3ImageUrl(
      user.imageUrl,
      user.imageKey,
      '/images/profile-buyer.png',
    ),
  };
}

export async function toLikeStoreResponse(
  favorite: StoreFavoriteWithStore,
): Promise<LikeStoreResponseDto> {
  return {
    storeId: favorite.storeId,
    userId: favorite.userId,
    store: {
      id: favorite.store.id,
      userId: favorite.store.sellerId,
      name: favorite.store.name,
      address: favorite.store.address,
      detailAddress: favorite.store.detailAddress,
      phoneNumber: favorite.store.phoneNumber,
      content: favorite.store.content,
      image: await resolveS3ImageUrl(
        favorite.store.imageUrl,
        favorite.store.imageKey ?? null,
        '/images/Mask-group.svg',
      ),
      createdAt: favorite.store.createdAt.toISOString(),
      updatedAt: favorite.store.updatedAt.toISOString(),
    },
  };
}
