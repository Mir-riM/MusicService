import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { MinioBucket } from './types/minio';
import * as uuid from 'uuid';
import { MulterFile } from '../common/types/multer.types';

const BUCKETS: MinioBucket[] = [
  MinioBucket.TRACKS,
  MinioBucket.PICTURES,
  MinioBucket.PLAYLISTS,
];

@Injectable()
export class MinioService implements OnModuleInit {
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

  async onModuleInit() {
    const maxAttempts = 5;
    const delayMs = 2000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.ensureBuckets();
        return;
      } catch (err: any) {
        if (attempt === maxAttempts) {
          console.error('MinIO ensureBuckets failed after', maxAttempts, 'attempts:', err?.message ?? err);
          throw err;
        }
        console.warn(`MinIO not ready (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms...`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  private async ensureBuckets() {
    for (const bucket of BUCKETS) {
      try {
        await this.s3.send(new HeadBucketCommand({ Bucket: bucket }));
      } catch (err: any) {
        const isMissing =
          err?.name === 'NotFound' ||
          err?.name === 'NoSuchBucket' ||
          err?.$metadata?.httpStatusCode === 404;
        if (isMissing) {
          await this.s3.send(new CreateBucketCommand({ Bucket: bucket }));
          const policy = JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucket}/*`],
              },
            ],
          });
          await this.s3.send(
            new PutBucketPolicyCommand({ Bucket: bucket, Policy: policy }),
          );
          console.log(`MinIO bucket created and set public: ${bucket}`);
        } else {
          throw err;
        }
      }
    }
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
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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

  async deleteObject(key: string, bucket: MinioBucket) {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
