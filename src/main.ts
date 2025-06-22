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

  const configService = app.get(ConfigService);
  const redisClient = getRedisClient(configService.get('REDIS_URL')!);

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
        secure: configService.get('NODE_ENV') === 'production',
        signed: true,
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  setupSwagger(app);

  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}

bootstrap();
