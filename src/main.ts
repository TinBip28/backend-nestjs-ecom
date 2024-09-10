import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as process from 'node:process';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  const configService = app.get(ConfigService);
  await app.listen(configService.get<string>('PORT') || 3000);
}
bootstrap().then(() => {
  console.log(
    `Application is running on: http://localhost:${process.env['PORT'] || 3000}`,
  );
  console.log('Press Ctrl+C to quit.');
});
