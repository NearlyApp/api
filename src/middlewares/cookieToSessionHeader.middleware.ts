import { NextFunction, Request, Response } from 'express';
import { UAParser } from 'ua-parser-js';

const cookieToSessionHeaderMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userAgent = req.headers['user-agent'];

  if (!userAgent) next();

  const parser = new UAParser();
  parser.setUA(userAgent!);

  const result = parser.getResult();

  if (result.device.type === 'mobile' || result.device.type === 'tablet') {
    res.setHeader('X-Session-Id', req.sessionID);
  }

  next();
};

export default cookieToSessionHeaderMiddleware;
