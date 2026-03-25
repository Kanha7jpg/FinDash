import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      res.status(422).json({
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors
      });
      return;
    }

    req.body = parsed.data as unknown;
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);

    if (!parsed.success) {
      res.status(422).json({
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors
      });
      return;
    }

    (req as Request & { validatedQuery?: T }).validatedQuery = parsed.data;
    next();
  };
}

export function validateParams<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.params);

    if (!parsed.success) {
      res.status(422).json({
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors
      });
      return;
    }

    (req as Request & { validatedParams?: T }).validatedParams = parsed.data;
    next();
  };
}
