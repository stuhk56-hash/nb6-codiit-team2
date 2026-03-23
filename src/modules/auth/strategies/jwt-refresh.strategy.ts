import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AUTH_CONSTANTS } from '../constants/auth.constant';
import { AuthPayload } from '../interfaces/auth-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      // 1. 헤더의 Authorization: Bearer <token> 에서 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: AUTH_CONSTANTS.JWT.SECRET, // 실제로는 REFRESH_SECRET을 따로 쓰는 것이 보안상 좋습니다.
      passReqToCallback: true, // 로직에서 실제 토큰 문자열을 쓰기 위해 true 설정
    });
  }

  /**
   * 2. 토큰 검증 성공 후 실행되는 로직
   * 피그마 대시보드 접근 중 토큰이 만료되었을 때, 이 메서드가 유저 신원을 확인합니다.
   */
  async validate(req: Request, payload: AuthPayload) {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException(
        AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN,
      );
    }

    // 여기서 AuthService를 통해 DB에 저장된 hashedRefreshToken과 비교하는 로직을 추가하는 것이 정석입니다.
    // return 값은 가드를 통과한 후 req.user에 담기게 됩니다.
    return {
      ...payload,
      refreshToken,
    };
  }
}
