import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch() // ловим ВСЕ ошибки
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 1️⃣ Если это HttpException (401, 400, 403 и т.д.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      // если ты кинул объект { code, message, fields }
      if (typeof res === 'object' && res !== null) {
        return response.status(status).json({
          statusCode: status,
          ...(res as object),
        });
      }

      // если кинул строку
      return response.status(status).json({
        statusCode: status,
        code: 'UNKNOWN_ERROR',
        message: res,
      });
    }

    // 2️⃣ Любая НЕПРЕДВИДЕННАЯ ошибка
    console.error(exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
  }
}
