import {
  LoginResponseDto,
  LoginUser,
  LoginUserPayloadDto,
  RefreshResponseDto,
} from '../types/auth.type';

export function toLoginUserPayload(
  user: LoginUser,
  image: string,
): LoginUserPayloadDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    type: user.type,
    points: user.points,
    image,
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
