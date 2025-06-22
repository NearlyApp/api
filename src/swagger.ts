import { AUTH_COOKIE_NAME } from '@modules/auth/auth.constants';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('NearlyAPI')
    .addCookieAuth(AUTH_COOKIE_NAME)
    .build();

  const documentFactory = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, documentFactory);
}
