import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from './schemas/track.schema';
import { Model, Types } from 'mongoose';
import { createTrackDto } from './dto/createTrack.dto';
import { MinioService } from '../minio/minio.service';
import { MinioBucket } from '../minio/types/minio';
import { TrackLikeDto } from './dto/trackLike.dto';
import { TrackLike } from './schemas/trackLike.schema';
import { MulterFile } from '../common/types/multer.types';
import { UserRole } from '../auth/schemas/user.schema';

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(TrackLike.name) private trackLikeModel: Model<TrackLike>,
    private minioService: MinioService,
  ) { }

  async create(
    dto: createTrackDto,
    picture: MulterFile,
    track: MulterFile,
    ownerId: string,
  ): Promise<Track> {
    try {
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
        ownerId: new Types.ObjectId(ownerId),
        listenings: 0,
        pictureUrl: picturePath,
        trackUrl: trackPath,
      });
      return trackResponce;
    } catch (e) {
      console.error('CREATE TRACK ERROR:', e);
      throw new InternalServerErrorException(e.message);
    }
  }

  async getAll(count: number, offset: number): Promise<Track[]> {
    const tracks = await this.trackModel.find().skip(offset).limit(count);
    return tracks;
  }

  async getOne(id: string): Promise<Track> {
    const track = await this.trackModel.findById(id).populate('comments');

    if (!track) {
      throw new NotFoundException('Трек не найден');
    }

    return track;
  }

  async delete(
    id: string,
    userId: string,
    userRoles: string[],
  ): Promise<{ id: string }> {
    const track = await this.trackModel.findById(id);

    if (!track) {
      throw new NotFoundException('Трек не найден');
    }

    const canDeleteByRole =
      userRoles.includes(UserRole.ADMIN) || userRoles.includes(UserRole.MODERATOR);
    const isOwner = track.ownerId.toString() === userId;

    if (!isOwner && !canDeleteByRole) {
      throw new ForbiddenException('Удалять трек может только владелец или модератор');
    }

    await this.trackModel.findByIdAndDelete(id);

    return { id };
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

  async toggleLike(dto: TrackLikeDto, userId: string): Promise<void> {
    const existingLike = await this.trackLikeModel.findOne({
      userId,
      trackId: dto.trackId,
    });
    if (existingLike) {
      await this.trackLikeModel.deleteOne({
        userId,
        trackId: dto.trackId,
      });
    } else {
      await this.trackLikeModel.create({
        trackId: dto.trackId,
        userId,
      });
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
