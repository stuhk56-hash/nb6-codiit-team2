/**
 * Contains type definitions related to JWT.
 */

/**
 * Interface for the raw JWT payload.
 * This is the object that is encoded in the JWT.
 * The `validate` method of the JwtStrategy receives this payload.
 */
export interface JwtPayload {
  /** User ID (subject of the token) */
  sub: number;

  /** User email */
  email: string;

  /** User role */
  role: 'BUYER' | 'SELLER' | 'ADMIN';
}
