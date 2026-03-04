import { LoginUser } from '../types/auth.type';

export function toLoginUserPayload(user: LoginUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    type: user.type,
    points: user.points,
    image: user.imageUrl,
    grade: user.grade,
  };
}

export function toLoginResponse(user: ReturnType<typeof toLoginUserPayload>, accessToken: string, refreshToken: string) {
  return {
    user,
    accessToken,
    refreshToken,
  };
}

export function toRefreshResponse(accessToken: string) {
  return {
    accessToken,
  };
}
