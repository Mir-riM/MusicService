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
import { PaginatedResponse } from '../common/types/pagination';

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(TrackLike.name) private trackLikeModel: Model<TrackLike>,
    private minioService: MinioService,
  ) { }

  private resolvePagination(limit?: number, offset?: number) {
    return {
      limit: Math.min(Math.max(limit ?? 20, 1), 50),
      offset: Math.max(offset ?? 0, 0),
    };
  }

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

  async getAll(
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponse<Track>> {
    const pagination = this.resolvePagination(limit, offset);
    const [items, total] = await Promise.all([
      this.trackModel
        .find()
        .sort({ createdAt: -1, _id: -1 })
        .skip(pagination.offset)
        .limit(pagination.limit),
      this.trackModel.countDocuments(),
    ]);

    return {
      items,
      pageInfo: {
        ...pagination,
        total,
        hasMore: pagination.offset + items.length < total,
      },
    };
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

  async search(
    query: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponse<Track>> {
    const pagination = this.resolvePagination(limit, offset);
    query = query.trim().toLocaleLowerCase();
    const filter = {
      $or: [
        { name: { $regex: new RegExp(query, 'i') } },
        { author: { $regex: new RegExp(query, 'i') } },
      ],
    };
    const [items, total] = await Promise.all([
      this.trackModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(pagination.offset)
        .limit(pagination.limit),
      this.trackModel.countDocuments(filter),
    ]);

    return {
      items,
      pageInfo: {
        ...pagination,
        total,
        hasMore: pagination.offset + items.length < total,
      },
    };
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

  async getLikeTracks(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponse<Track>> {
    const pagination = this.resolvePagination(limit, offset);
    const [likes, total] = await Promise.all([
      this.trackLikeModel
        .find({ userId })
        .sort({ _id: -1 })
        .select('trackId')
        .skip(pagination.offset)
        .limit(pagination.limit)
        .lean(),
      this.trackLikeModel.countDocuments({ userId }),
    ]);

    const trackIds = likes.map((l) => l.trackId);
    const tracks = await this.trackModel.find({ _id: { $in: trackIds } });
    const tracksById = new Map(tracks.map((track) => [track._id.toString(), track]));
    const orderedTracks = trackIds
      .map((id) => tracksById.get(id.toString()))
      .filter(Boolean) as Track[];

    return {
      items: orderedTracks,
      pageInfo: {
        ...pagination,
        total,
        hasMore: pagination.offset + orderedTracks.length < total,
      },
    };
  }

  async getUploadedByUser(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponse<Track>> {
    const pagination = this.resolvePagination(limit, offset);
    if (!Types.ObjectId.isValid(userId)) {
      return {
        items: [],
        pageInfo: {
          ...pagination,
          total: 0,
          hasMore: false,
        },
      };
    }

    const filter = { ownerId: new Types.ObjectId(userId) };
    const [items, total] = await Promise.all([
      this.trackModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(pagination.offset)
        .limit(pagination.limit),
      this.trackModel.countDocuments(filter),
    ]);

    return {
      items,
      pageInfo: {
        ...pagination,
        total,
        hasMore: pagination.offset + items.length < total,
      },
    };
  }
}
