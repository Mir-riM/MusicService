import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from './schemas/track.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model, ObjectId } from 'mongoose';
import { createTrackDto, MulterFile } from './dto/createTrack.dto';
import { CreateCommentDto } from './dto/createComment.dto';
import { MinioService } from '../minio/minio.service';
import { MinioBucket } from '../minio/types/minio';
import { TrackLikeDto } from './dto/trackLike.dto';
import { TrackLike } from './schemas/trackLike.schema';

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(TrackLike.name) private trackLikeModel: Model<TrackLike>,
    private minioService: MinioService,
  ) {}

  async create(
    dto: createTrackDto,
    picture: MulterFile,
    track: MulterFile,
  ): Promise<Track> {
    const trackPath = await this.minioService.putObject(
      track,
      MinioBucket.TRACKS,
    );
    const picturePath = await this.minioService.putObject(
      picture,
      MinioBucket.PICTURES,
    );

    const trackResponce = await this.trackModel.create({
      ...dto,
      listenings: 0,
      pictureUrl: picturePath,
      trackUrl: trackPath,
    });
    return trackResponce;
  }

  async getAll(count: number, offset: number): Promise<Track[]> {
    const tracks = await this.trackModel.find().skip(offset).limit(count);
    return tracks;
  }

  async getOne(id: ObjectId): Promise<Track> {
    const track = await this.trackModel.findById(id).populate('comments');

    if (!track) {
      throw new NotFoundException('Трек не найден');
    }

    return track;
  }

  async delete(id: ObjectId): Promise<ObjectId> {
    await this.trackModel.findByIdAndDelete(id);

    return id;
  }

  async createComment(dto: CreateCommentDto): Promise<Comment> {
    const track = await this.trackModel.findById(dto.trackId);
    const comment = await this.commentModel.create(dto);
    track?.comments.push(comment._id);
    await track?.save();
    return comment;
  }

  async listen(trackId: string) {
    await this.trackModel.updateOne(
      { _id: trackId },
      { $inc: { listenings: 1 } },
    );
  }

  async search(query: string): Promise<Track[]> {
    query = query.trim().toLocaleLowerCase();
    const tracks = await this.trackModel.find({
      $or: [
        { name: { $regex: new RegExp(query, 'i') } },
        { author: { $regex: new RegExp(query, 'i') } },
      ],
    });

    return tracks;
  }

  async toggleLike(dto: TrackLikeDto): Promise<void> {
    const existingLike = await this.trackLikeModel.findOne({
      userId: dto.userId,
      trackId: dto.trackId,
    });
    if (existingLike) {
      await this.trackLikeModel.deleteOne({
        userId: dto.userId,
        trackId: dto.trackId,
      });
    } else {
      await this.trackLikeModel.create(dto);
    }
  }

  async getLikeLinks(userId: string): Promise<TrackLike[]> {
    return await this.trackLikeModel.find({ userId });
  }

  async getLikeTracks(userId: string): Promise<TrackDocument[]> {
    const likes = await this.trackLikeModel
      .find({ userId })
      .select('trackId')
      .lean();

    const trackIds = likes.map((l) => l.trackId);

    return this.trackModel.find({ _id: { $in: trackIds } });
  }
}
