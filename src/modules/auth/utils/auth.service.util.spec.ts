import { hashPassword } from '../../../lib/constants/password';
import { UnauthorizedError } from '../../../lib/errors/customErrors';
import { ensureLoginMatched } from './auth.service.util';

describe('auth.service.util', () => {
  describe('ensureLoginMatched', () => {
    it('should pass for hashed password', () => {
      const password = 'codiit1234';
      const user = { passwordHash: hashPassword(password) };

      expect(() =>
        ensureLoginMatched(user, { email: 'test@codiit.com', password }),
      ).not.toThrow();
    });

    it('should pass for legacy plain password', () => {
      const user = { passwordHash: 'codiit1234' };

      expect(() =>
        ensureLoginMatched(user, {
          email: 'test@codiit.com',
          password: 'codiit1234',
        }),
      ).not.toThrow();
    });

    it('should throw UnauthorizedError for mismatched password', () => {
      const user = { passwordHash: hashPassword('codiit1234') };

      expect(() =>
        ensureLoginMatched(user, {
          email: 'test@codiit.com',
          password: 'wrong',
        }),
      ).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for missing user', () => {
      expect(() =>
        ensureLoginMatched(null, {
          email: 'test@codiit.com',
          password: 'codiit1234',
        }),
      ).toThrow(UnauthorizedError);
    });
  });
});
