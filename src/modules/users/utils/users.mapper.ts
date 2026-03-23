import { LikeStoreResponseDto } from '../dto/like-store-response.dto';
import { UserGradeDto, UserResponseDto } from '../dto/user-response.dto';
import { UserGradeName } from '../enums/user-grade.enum';
import { StoreFavoriteWithStore, UserWithGrade } from '../types/users.type';

function toRequiredImage(value: string | null | undefined, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  return fallback;
}

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
    isGreenGrade: grade.name === UserGradeName.GREEN,
    label: `${grade.name.toUpperCase()} (${grade.rate}%)`,
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
    image: toRequiredImage(user.imageUrl, '/images/profile-buyer.png'),
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
      image: toRequiredImage(favorite.store.imageUrl, '/images/Mask-group.svg'),
      createdAt: favorite.store.createdAt.toISOString(),
      updatedAt: favorite.store.updatedAt.toISOString(),
    },
  };
}
