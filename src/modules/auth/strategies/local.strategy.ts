import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AUTH_CONSTANTS } from '../constants/auth.constant';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // 1. 피그마 로그인 폼의 필드 이름과 맞춥니다.
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * 2. 가드가 실행될 때 호출되는 검증 로직입니다.
   * @param email 유저가 입력한 이메일
   * @param password 유저가 입력한 비밀번호
   */
  async validate(email: string, password: string): Promise<any> {
    // AuthService에서 실제 DB 조회 및 bcrypt 비밀번호 비교를 수행합니다.
    const user = await this.authService.validateUser(email, password);

    // 검증 실패 시 피그마 에러 UI에 대응하는 메시지를 던집니다.
    if (!user) {
      throw new UnauthorizedException(
        AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS,
      );
    }

    // 성공 시 반환된 유저 객체는 LocalAuthGuard를 거쳐 req.user에 담깁니다.
    return user;
  }
}
