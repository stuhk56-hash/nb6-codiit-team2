import { User } from '@prisma/client';

export type LoginInput = {
  email: string;
  password: string;
};

export type RefreshTokenRow = {
  userId: string;
  revokedAt: Date | null;
  expiresAt: Date;
};

export type LoginUser = User & {
  grade: {
    id: string;
    name: string;
    minAmount: number;
    rate: number;
  } | null;
};

export type LoginUserPayloadDto = {
  id: string;
  email: string;
  name: string;
  type: LoginUser['type'];
  points: number;
  image: string;
  grade: LoginUser['grade'];
};

export type LoginResponseDto = {
  user: LoginUserPayloadDto;
  accessToken: string;
  refreshToken: string;
};

export type RefreshResponseDto = {
  accessToken: string;
};
