import { setupSwagger } from '@/swagger';
import { ConfigService } from '@config/config.service';
import getRedisClient from '@lib/getRedisClient';
import { AppModule } from '@modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import passport from 'passport';

const DEFAULT_PORT = 3000;

const ALLOWED_DOMAINS = ['https://api.nearly.teamzbl.com/'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const redisClient = await getRedisClient(configService.get('REDIS_URL')!);

  app.enableCors({
    origin: ALLOWED_DOMAINS,
    credentials: true,
  });

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
        secure: false, // For local development, set to false
        signed: true,
        sameSite: 'lax',
        domain: '.nearly.teamzbl.com',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  setupSwagger(app);

  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
