import { Request, Response, NextFunction } from 'express';

export function LoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = Date.now();
  const startedAt = new Date().toISOString();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const user = (req as Request & { user?: { email?: string; sub?: string } }).user;
    const userLabel = user ? user.email ?? user.sub : 'anonymous';
    const contentLength = res.getHeader('content-length') ?? '-';
    const ua = (req.get('user-agent') ?? '').slice(0, 80);

    console.log(
      JSON.stringify({
        ts: startedAt,
        level: res.statusCode >= 400 ? 'warn' : 'info',
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ms,
        user: userLabel,
        ip: req.ip,
        contentLength,
        userAgent: ua,
        query: Object.keys(req.query).length ? req.query : undefined,
      }),
    );
  });

  next();
}
