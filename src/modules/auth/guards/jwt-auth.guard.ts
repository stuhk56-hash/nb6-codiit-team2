import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_CONSTANTS } from '../constants/auth.constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * 1. 가드가 실행될 때 호출됩니다.
   * 부모 클래스의 canActivate를 먼저 실행하여 JWT 검증을 수행합니다.
   */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  /**
   * 2. JWT 검증 후 결과를 처리하는 로직입니다.
   * 검증 실패 시 피그마 에러 UI에 대응하는 메시지를 던집니다.
   */
  handleRequest(err: any, user: any, info: any) {
    // 토큰이 없거나, 만료되었거나, 유효하지 않은 경우
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(AUTH_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED)
      );
    }

    // 검증 성공 시 유저 객체(Payload)를 Request 객체(req.user)에 담습니다.
    return user;
  }
}
