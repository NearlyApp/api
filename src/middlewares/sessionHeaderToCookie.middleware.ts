import { NextFunction, Request, Response } from 'express';
import { UAParser } from 'ua-parser-js';

const sessionHeaderToCookieMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userAgent = req.headers['user-agent'];
  const sessionId = req.headers['X-Session-Id'] || req.headers['x-session-id'];

  if (!userAgent) next();

  const parser = new UAParser();
  parser.setUA(userAgent!);

  const result = parser.getResult();

  if (
    typeof sessionId === 'string' &&
    (result.device.type === 'mobile' || result.device.type === 'tablet')
  ) {
    const currentCookie = req.headers.cookie ? req.headers.cookie + '; ' : '';
    req.headers.cookie = `${currentCookie}connect.sid=${sessionId}`;
  }

  next();
};

export default sessionHeaderToCookieMiddleware;
