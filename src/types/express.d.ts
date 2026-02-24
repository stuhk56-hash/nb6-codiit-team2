declare global {
  namespace Express {
    /**
     * Represents the user object attached to the request after JWT authentication.
     * This is based on the return value of the `validate` function in `JwtStrategy`.
     */
    interface User {
      /** User's unique ID. From JWT payload's 'sub' claim. */
      id: number;
      /** User's email address. From JWT payload. */
      email: string;
      /** User's role. From JWT payload. */
      role: 'BUYER' | 'SELLER' | 'ADMIN';
    }

    interface Request {
      user?: User;
    }
  }
}

// This empty export is needed to treat this file as a module and make the global declaration work.
export {};
