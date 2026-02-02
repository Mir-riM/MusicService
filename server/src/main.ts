import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

const start = async () => {
  try {
    const PORT = process.env.PORT || 4000;
    const HOST = process.env.HOSTNAME || '0.0.0.0';
    const app = await NestFactory.create(AppModule);
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
