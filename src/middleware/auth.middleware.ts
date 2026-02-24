import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// This is a basic authentication middleware.
// You would typically inject a service here (e.g., AuthService) to handle token verification.
// For example: constructor(private readonly authService: AuthService) {}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Here you would typically verify the token.
      // For example, using a method from an injected AuthService.
      // const user = this.authService.validateToken(token);
      //
      // If the token is valid, you can attach the user to the request.
      // req.user = user;

      console.log(`Auth token found: ${token}`); // Placeholder
    } else {
        // Depending on the route, you might want to throw an error
        // if no token is provided.
        // For now, we'll just log it.
        console.log('No auth token found.');
    }

    next();
  }
}
