import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass, ClassConstructor } from 'class-transformer';

/*
 * This is a factory for creating validation middleware.
 * It takes a DTO class as an argument and returns a middleware
 * that validates the request body against that class.
 *
 * While this works, the more conventional way to handle validation in NestJS
 * is by using the built-in `ValidationPipe`.
 *
 * How to use this middleware in a module:
 *
 * import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
 * import { validationMiddleware } from './validate.middleware';
 * import { CreateProductDto } from '../modules/products/dto/create-product.dto'; // Assuming this DTO exists
 *
 * @Module({})
 * export class ProductModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(validationMiddleware(CreateProductDto))
 *       .forRoutes({ path: 'products', method: RequestMethod.POST });
 *   }
 * }
 */
export function validationMiddleware<T extends object>(type: ClassConstructor<T>): any {
  @Injectable()
  class ValidationMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
      const objectToValidate = plainToClass(type, req.body);
      const errors = await validate(objectToValidate);

      if (errors.length > 0) {
        // Collect all error messages
        const errorMessages = errors.flatMap(error => Object.values(error.constraints));
        throw new BadRequestException(errorMessages);
      }

      // Assign transformed and validated body back to the request
      req.body = objectToValidate;

      next();
    }
  }

  return ValidationMiddleware;
}
