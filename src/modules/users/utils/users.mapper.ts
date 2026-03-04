import { LikeStoreResponseDto } from '../dto/like-store-response.dto';
import { UserGradeDto, UserResponseDto } from '../dto/user-response.dto';
import { StoreFavoriteWithStore, UserWithGrade } from '../types/users.type';

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

export function toUserResponse(user: UserWithGrade): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.type,
    points: user.points,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    grade: toGradeResponse(user.grade),
    image: user.imageUrl,
  };
}

export function toLikeStoreResponse(
  favorite: StoreFavoriteWithStore,
): LikeStoreResponseDto {
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
      image: favorite.store.imageUrl,
      createdAt: favorite.store.createdAt.toISOString(),
      updatedAt: favorite.store.updatedAt.toISOString(),
    },
  };
}
