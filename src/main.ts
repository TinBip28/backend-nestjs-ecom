import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as process from 'node:process';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './core/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());

  //Config cors
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  //Config versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2'],
  });

  //Enable cookie
  app.use(cookieParser());

  //Config guard
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  //Config static file
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  //Interceptors
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  await app.listen(configService.get<string>('PORT') || 3000);
}

bootstrap().then(() => {
  console.log(
    `Application is running on: http://localhost:${process.env['PORT'] || 3000}`,
  );
});
