import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_CONSTANTS } from '../constants/auth.constant';

/**
 * [로그인 전용 가드]
 * 이메일과 비밀번호를 검증하는 'local' 전략을 실행합니다.
 * 피그마 로그인 폼의 데이터가 LocalStrategy로 전달되도록 돕습니다.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  /**
   * 1. 가드가 실행될 때 호출됩니다.
   * Passport의 local 전략을 호출하여 이메일/비밀번호 일치 여부를 확인합니다.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }

  /**
   * 2. LocalStrategy에서 검증이 끝난 후 결과를 처리합니다.
   * 아이디나 비밀번호가 틀렸을 때 피그마 에러 UI에 맞는 메시지를 던집니다.
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS,
        )
      );
    }
    return user;
  }
}
