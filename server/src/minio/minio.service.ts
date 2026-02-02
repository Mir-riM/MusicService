import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MinioBucket } from './types/minio';
import { MulterFile } from '../track/dto/create-track.dto';
import * as uuid from 'uuid';

@Injectable()
export class MinioService {
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: 'eu-west-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
  }

  async putObject(file: MulterFile, bucket: MinioBucket): Promise<string> {
    try {
      const fileExrension = file.originalname.split('.').pop();
      const fileName = `${uuid.v4()}.${fileExrension}`;
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: fileName,
          Body: file.buffer,
        }),
      );
      const filePath = `${bucket}/${fileName}`;
      return filePath;
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getObject(key: string, bucket: MinioBucket) {
    try {
      await this.s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
