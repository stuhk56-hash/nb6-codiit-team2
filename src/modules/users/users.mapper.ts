import { User } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import { UserGradeName } from './enums/user-grade.enum';
import { USER_CONSTANTS } from './constants/user.constant';
import { UserWithGrade } from './types/users.type';

export class UserMapper {
  /**
   * User 엔티티를 클라이언트 응답용 DTO로 변환합니다.
   * 피그마의 바이어/셀러 대시보드에서 필요한 포맷을 맞춥니다.
   */
  static toResponseDto(user: UserWithGrade): UserResponseDto {
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      points: user.points,
      // 이미지가 없으면 상수 파일의 기본 이미지 URL 제공
      image: user.imageUrl || USER_CONSTANTS.ASSETS.DEFAULT_PROFILE_IMAGE,

      // 등급(Grade) 정보 가공 (피그마 UI 배지 및 적립률 표시용)
      grade: user.grade
        ? {
            id: user.grade.id,
            name: user.grade.name,
            rate: user.grade.rate,
            minAmount: user.grade.minAmount,
            // UI 로직: Green 등급 여부 판별 (배지 색상 결정 등)
            isGreenGrade: user.grade.name === UserGradeName.GREEN,
            // UI 텍스트 포맷팅 (예: "GREEN GRADE (5%)")
            label: `${user.grade.name.toUpperCase()} (${user.grade.rate}%)`,
          }
        : null,

      // 날짜 포맷 (ISO String으로 변환하여 프론트엔드 전달)
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * 여러 명의 유저 목록을 변환할 때 사용합니다.
   */
  static toResponseDtoList(users: UserWithGrade[]): UserResponseDto[] {
    return users.map((user) => this.toResponseDto(user));
  }
}
