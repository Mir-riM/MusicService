import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';

const start = async () => {
  try {
    const PORT = process.env.PORT || 4000;
    const HOST = process.env.HOSTNAME || '0.0.0.0';
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new ApiExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        // Do not break old clients abruptly: strip unknown fields instead of rejecting.
        forbidNonWhitelisted: false,
        exceptionFactory: (errors: ValidationError[]) => {
          const fields: Record<string, string> = {};

          const collectErrors = (validationErrors: ValidationError[], parent = '') => {
            for (const error of validationErrors) {
              const currentField = parent ? `${parent}.${error.property}` : error.property;

              if (error.constraints) {
                const firstErrorMessage = Object.values(error.constraints)[0];
                if (!fields[currentField] && firstErrorMessage) {
                  fields[currentField] = firstErrorMessage;
                }
              }

              if (error.children?.length) {
                collectErrors(error.children, currentField);
              }
            }
          };

          collectErrors(errors);

          return new BadRequestException({
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            fields,
          });
        },
      }),
    );
    app.use(cookieParser());
    app.enableCors({
      origin: true,
      credentials: true,
    });
    await app.listen(PORT, HOST, () =>
      console.log(`Приложение запущено на ${HOST}:${PORT}`),
    );
  } catch (error) {
    console.error('Ошибка при запуске приложения:', error);
    process.exit(1);
  }
};

start();
