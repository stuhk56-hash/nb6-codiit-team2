import { UserEntity } from '../../users/entities/user.entity';

export type LoginInput = {
  email: string;
  password: string;
};

export type RefreshTokenRow = {
  userId: string;
  revokedAt: Date | null;
  expiresAt: Date;
};

export type LoginUser = UserEntity & {
  grade: {
    id: string;
    name: string;
    minAmount: number;
    rate: number;
  } | null;
};
