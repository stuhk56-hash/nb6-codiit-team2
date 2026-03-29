import { Request } from 'express';
import { AuthPayload } from './auth-payload.interface';

export interface RequestWithUser extends Request {
  user: AuthPayload; // 가드를 통과한 후 req.user에 담길 데이터 타입
}
