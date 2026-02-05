import { Module } from '@nestjs/common';
import { TrackModule } from './track/track.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { MinioModule } from './minio/minio.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthModule } from './jwt/jwt.module';
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TrackModule,
    ServeStaticModule.forRoot({ rootPath: path.resolve(__dirname, 'static') }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config) => ({
        uri: config.getOrThrow('MONGO_DB_CONNECT_LINK'),
      }),
    }),
    HealthModule,
    MinioModule,
    AuthModule,
    JwtAuthModule,
    PlaylistsModule,
  ],
})
export class AppModule {}
