import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { USER_CONSTANTS } from '../constants/user.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. 해당 핸들러(메서드)나 클래스에 설정된 'roles' 메타데이터를 가져옵니다.
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. 설정된 역할이 없다면 누구나 접근 가능한 API이므로 true 반환
    if (!requiredRoles) {
      return true;
    }

    // 3. 요청 객체에서 유저 정보를 꺼냅니다. (보통 AuthGuard가 이 정보를 넣어줍니다.)
    const { user } = context.switchToHttp().getRequest();

    // 4. 유저 정보가 없거나, 유저의 타입이 요구되는 역할에 포함되지 않으면 에러 발생
    const hasRole = requiredRoles.some((role) => user?.type === role);

    if (!hasRole) {
      throw new ForbiddenException(
        USER_CONSTANTS.ERROR_MESSAGES.FORBIDDEN_SELLER_ONLY,
      );
    }

    return true;
  }
}
