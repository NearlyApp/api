import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder().setTitle('NearlyAPI').build();

  const documentFactory = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      withCredentials: true,
      requestInterceptor: (req) => {
        req.withCredentials = true;
        return req;
      },
    },
  });
}
