import { Request, Response, NextFunction } from 'express';

export function LoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const user = (req as any).user
      ? (req as any).user.email || (req as any).user.id
      : 'anonymous';
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms - user:${user}`,
    );
  });
  next();
}
