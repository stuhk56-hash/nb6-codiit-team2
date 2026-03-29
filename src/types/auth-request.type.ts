import { Request } from 'express';
import { User } from '@prisma/client';

export type AuthenticatedUser = User;

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export type AuthRequest = AuthenticatedRequest;

export type AuthUser = NonNullable<AuthenticatedRequest['user']>;
