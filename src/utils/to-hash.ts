/**
 * @description 비밀번호 해싱 유틸리티 모듈
 * 언제든지 수정 가능하니 문제 있으면 알려주세요!
 * @date 2026-02-25
 * @version 1.0
 **/

import bcrypt from 'bcrypt';

export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashPassword);
};
