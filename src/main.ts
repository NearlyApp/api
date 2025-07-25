import { LoggingInterceptor } from '@/interceptors/logging.interceptor';
import ValidatorPipe from '@/pipes/validator.pipe';
import { setupSwagger } from '@/swagger';
import { ConfigService } from '@config/config.service';
import getRedisClient from '@lib/getRedisClient';
import { AppModule } from '@modules/app.module';
import { NestFactory } from '@nestjs/core';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import passport from 'passport';

const DEFAULT_PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidatorPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const configService = app.get(ConfigService);
  const redisClient = await getRedisClient(configService.get('REDIS_URL')!);

  // app.use(sessionHeaderToCookieMiddleware);
  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
      }),
      secret: configService.get('SECRET_KEY')!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        // secure: configService.get('NODE_ENV') === 'production',
        secure: false,
        signed: true,
        sameSite: 'lax',
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  // app.use(cookieToSessionHeaderMiddleware);

  setupSwagger(app);

  const port = process.env.PORT ?? DEFAULT_PORT;
  if (configService.get('NODE_ENV') === 'production') await app.listen(port);
  else await app.listen(port, '0.0.0.0'); // Allows to connect from other devices on the same network
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
