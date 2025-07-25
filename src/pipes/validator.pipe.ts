import { BadRequestException, ValidationPipe } from '@nestjs/common';

export default class ValidatorPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const fieldErrors = errors.reduce(
          (acc, err) => {
            acc[err.property] = Object.values(err.constraints || {});
            return acc;
          },
          {} as Record<string, string[]>,
        );

        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          error: 'Bad Request',
          errors: fieldErrors,
        });
      },
    });
  }
}
