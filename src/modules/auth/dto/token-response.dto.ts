import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class TokenResponseDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsOptional() // Refresh Token 사용 시 포함
  refreshToken?: string;

  @IsNumber()
  @IsNotEmpty()
  expiresIn: number; // 토큰 만료 시간 (단위: 초)

  // --- 클라이언트 편의를 위한 유저 요약 정보 (선택 사항) ---
  @IsNotEmpty()
  user: {
    id: string;
    email: string;
    name: string;
    type: UserRole; // BUYER 또는 SELLER 분기 처리에 사용
  };
}
