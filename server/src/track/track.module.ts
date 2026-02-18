import { Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './schemas/track.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { MinioModule } from '../minio/minio.module';
import { TrackLike, TrackLikeSchema } from './schemas/trackLike.schema';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  providers: [TrackService, CommentsService],
  controllers: [TrackController, CommentsController],
  imports: [
    MinioModule,
    MongooseModule.forFeature([
      { name: Track.name, schema: TrackSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: TrackLike.name, schema: TrackLikeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
})
export class TrackModule {}
