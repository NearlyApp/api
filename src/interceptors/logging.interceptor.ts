import { User } from '@nearlyapp/common';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';

interface HttpError extends Error {
  status?: number;
  getStatus?(): number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const request: Request = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const user: Nullable<User> = request.user;

        this.logger.log(
          `${request.method} ${request.originalUrl} ${duration}ms - requested by ${user?.email || 'ANONYMOUS'}`,
        );
      }),
      catchError((error: HttpError) => {
        const duration = Date.now() - start;
        const user: Nullable<User> = request.user;
        const status = error.getStatus?.() || error.status || 500;

        this.logger.error(
          `${request.method} ${request.originalUrl} ${duration}ms - ${status} - requested by ${user?.email || 'ANONYMOUS'}`,
        );
        if (status >= 500) this.logger.error(error);
        return throwError(() => error);
      }),
    );
  }
}
