import { Request } from 'express';
import { UserEntity } from '../modules/users/entities/user.entity';

export type AuthenticatedUser = UserEntity;

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export type AuthRequest = AuthenticatedRequest;

export type AuthUser = NonNullable<AuthenticatedRequest['user']>;
