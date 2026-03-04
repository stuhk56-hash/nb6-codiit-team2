import { ForbiddenError, UnauthorizedError } from '../errors/customErrors';
import { AuthRequest, AuthUser } from '../../types/auth-request.type';

export function requireAuthUser(req: AuthRequest): AuthUser {
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

export function requireBuyer(
  user: AuthUser,
  message = '구매자만 접근할 수 있습니다.',
): AuthUser {
  if (user.type !== 'BUYER') {
    throw new ForbiddenError(message);
  }

  return user;
}

export function requireSeller(
  user: AuthUser,
  message = '판매자만 접근할 수 있습니다.',
): AuthUser {
  if (user.type !== 'SELLER') {
    throw new ForbiddenError(message);
  }

  return user;
}
