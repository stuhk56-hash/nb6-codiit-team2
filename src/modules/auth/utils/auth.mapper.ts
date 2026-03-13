import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';
import {
  LoginResponseDto,
  LoginUser,
  LoginUserPayloadDto,
  RefreshResponseDto,
} from '../types/auth.type';

export async function toLoginUserPayload(
  user: LoginUser,
): Promise<LoginUserPayloadDto> {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    type: user.type,
    points: user.points,
    image: await resolveS3ImageUrl(
      user.imageUrl,
      user.imageKey,
      '/images/profile-buyer.png',
    ),
    grade: user.grade,
  };
}

export function toLoginResponse(
  user: LoginUserPayloadDto,
  accessToken: string,
  refreshToken: string,
): LoginResponseDto {
  return {
    user,
    accessToken,
    refreshToken,
  };
}

export function toRefreshResponse(accessToken: string): RefreshResponseDto {
  return {
    accessToken,
  };
}
