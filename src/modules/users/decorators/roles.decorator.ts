import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

// 'roles'라는 키로 허용된 역할 리스트를 메타데이터에 저장합니다.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
