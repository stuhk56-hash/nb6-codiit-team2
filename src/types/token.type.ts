import { JwtPayload } from 'jsonwebtoken';

export type TokenType = 'access' | 'refresh';

export type TokenPayload = JwtPayload & {
  sub: string;
  type: TokenType;
};
