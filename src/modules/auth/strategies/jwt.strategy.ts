import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_CONSTANTS } from '../constants/auth.constant';
import { AuthPayload } from '../interfaces/auth-payload.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      // 1. 헤더의 Authorization: Bearer <token> 에서 JWT 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. 만료된 토큰은 거절
      ignoreExpiration: false,
      // 3. 상수 파일에 정의된 Secret Key 사용
      secretOrKey: AUTH_CONSTANTS.JWT.SECRET,
    });
  }

  /**
   * 4. 토큰 복호화 및 검증 성공 시 호출되는 메서드
   * @param payload 토큰에 담겨있던 유저 정보 (id, email, type 등)
   * @returns req.user에 저장될 객체
   */
  async validate(payload: AuthPayload) {
    // 보안을 위해 실제 DB에 해당 유저가 여전히 존재하는지 확인 (선택 사항)
    const user = await this.usersService.getMyProfile(payload.id);

    if (!user) {
      throw new UnauthorizedException(
        AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN,
      );
    }

    // 여기서 반환하는 객체가 이후 모든 Controller의 @Request() req.user에 담깁니다.
    return {
      id: payload.id,
      email: payload.email,
      type: payload.type,
    };
  }
}
