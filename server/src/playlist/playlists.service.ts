import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Playlist,
  PlaylistDocument,
  PlaylistType,
} from './schemas/playlist.schema';
import mongoose, { Model } from 'mongoose';
import { CreatePlaylistDto } from './dto/createPlaylist.dto';
import { PlaylistTracks } from './schemas/playlistTracks.schema';
import { PlaylistSubscription } from './schemas/playlistSubscription.schema';
import { ToggleTrackInPlaylistDto } from './dto/toggleTrackInPlaylistDto.dto';
import { SubscribeOnPlaylistDto } from './dto/subscribeOnPlaylist.dto';
import { forkDto } from './dto/fork.dto';
import { EditPlaylistDto } from './dto/editPlaylist.dto';
import { MinioService } from '../minio/minio.service';
import { MinioBucket } from '../minio/types/minio';
import { MulterFile } from '../common/types/multer.types';
import { PageInfo, PaginatedResponse } from '../common/types/pagination';

export interface PlaylistWithTracks extends Playlist {
  tracks: PlaylistTracks[];
  subscribersCount: number;
  tracksPageInfo: PageInfo;
}

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<PlaylistDocument>,
    @InjectModel(PlaylistTracks.name)
    private playlistTrackModel: Model<PlaylistTracks>,
    @InjectModel(PlaylistSubscription.name)
    private playlistSubscriberModel: Model<PlaylistSubscription>,
    private minioService: MinioService,
  ) { }

  private resolvePagination(limit?: number, offset?: number) {
    return {
      limit: Math.min(Math.max(limit ?? 20, 1), 50),
      offset: Math.max(offset ?? 0, 0),
    };
  }

  private canViewPlaylist(
    playlist: Pick<Playlist, 'isPublic' | 'ownerId'>,
    userId?: string,
  ): boolean {
    if (playlist.isPublic) {
      return true;
    }

    if (!userId) {
      return false;
    }

    return playlist.ownerId.toString() === userId;
  }

  private async getSubscribersCountMap(
    playlistIds: string[],
  ): Promise<Map<string, number>> {
    if (playlistIds.length === 0) {
      return new Map();
    }

    const objectIds = playlistIds
      .map((id) => id.toString())
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (objectIds.length === 0) {
      return new Map();
    }

    const counts = await this.playlistSubscriberModel.aggregate([
      {
        $match: {
          playlistId: { $in: objectIds },
        },
      },
      {
        $group: {
          _id: '$playlistId',
          count: { $sum: 1 },
        },
      },
    ]);

    return new Map(
      counts.map((item: { _id: mongoose.Types.ObjectId; count: number }) => [
        item._id.toString(),
        item.count,
      ]),
    );
  }

  async create(
    dto: CreatePlaylistDto,
    picture: MulterFile | undefined,
    ownerId: string,
  ): Promise<Playlist> {
    let pictureUrl: string | undefined;

    if (picture) {
      pictureUrl = await this.minioService.putObject(
        picture,
        MinioBucket.PLAYLISTS,
      );
    }

    const playlist = await this.playlistModel.create({
      ...dto,
      ownerId,
      pictureUrl,
    });

    await this.playlistSubscriberModel.create({
      userId: ownerId,
      playlistId: playlist._id.toString(),
    });

    return playlist;
  }

  async getOne(
    id: string,
    limit?: number,
    offset?: number,
    userId?: string,
  ): Promise<PlaylistWithTracks> {
    const pagination = this.resolvePagination(limit, offset);
    const playlist = await this.playlistModel.findById(id);

    const [playlistTracks, totalTracks] = await Promise.all([
      this.playlistTrackModel
        .find({ playlistId: id })
        .sort({ position: 1, _id: 1 })
        .skip(pagination.offset)
        .limit(pagination.limit)
        .populate('track'),
      this.playlistTrackModel.countDocuments({ playlistId: id }),
    ]);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (!this.canViewPlaylist(playlist, userId)) {
      throw new NotFoundException('Playlist not found');
    }

    const subscribersCount = await this.playlistSubscriberModel.countDocuments({
      playlistId: id,
    });

    return {
      ...playlist.toObject(),
      tracks: playlistTracks,
      subscribersCount,
      tracksPageInfo: {
        ...pagination,
        total: totalTracks,
        hasMore: pagination.offset + playlistTracks.length < totalTracks,
      },
    };
  }

  async getPlaylistsBySubscriber(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponse<Playlist>> {
    const pagination = this.resolvePagination(limit, offset);
    const [playlistSubscriptions, total] = await Promise.all([
      this.playlistSubscriberModel
        .find({ userId })
        .sort({ _id: -1 })
        .skip(pagination.offset)
        .limit(pagination.limit),
      this.playlistSubscriberModel.countDocuments({ userId }),
    ]);

    const playlistIds = playlistSubscriptions.map((ps) => ps.playlistId);

    const playlists = await this.playlistModel
      .find({
      _id: { $in: playlistIds },
      })
      .lean();

    const subscribersCountMap = await this.getSubscribersCountMap(
      playlistIds,
    );

    const playlistsById = new Map(playlists.map((playlist) => [playlist._id.toString(), playlist]));
    const items = playlistIds
      .map((playlistId) => {
        const playlist = playlistsById.get(playlistId.toString());
        if (!playlist) return null;

        const ownerId = playlist.ownerId?.toString?.() ?? String(playlist.ownerId);
        const visible = playlist.isPublic || ownerId === userId;
        if (!visible) return null;

        return {
          ...playlist,
          subscribersCount: subscribersCountMap.get(playlistId.toString()) ?? 0,
        };
      })
      .filter(Boolean) as Playlist[];

    return {
      items,
      pageInfo: {
        ...pagination,
        total,
        hasMore: pagination.offset + items.length < total,
      },
    };
  }

  async getPlaylistTrackLink(userId: string) {
    return this.playlistModel.aggregate([
      {
        $lookup: {
          from: 'playlistsubscriptions',
          localField: '_id',
          foreignField: 'playlistId',
          as: 'subs',
        },
      },
      {
        $match: {
          'subs.userId': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'playlisttracks',
          localField: '_id',
          foreignField: 'playlistId',
          as: 'tracks',
        },
      },
      {
        $project: {
          subs: 0,
        },
      },
    ]);
  }

  async getPopular(
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponse<Playlist>> {
    const pagination = this.resolvePagination(limit, offset);
    const visibilityMatch = { isPublic: true };

    const [items, total] = await Promise.all([
      this.playlistModel.aggregate([
        { $match: visibilityMatch },
        {
          $lookup: {
            from: 'playlistsubscriptions',
            localField: '_id',
            foreignField: 'playlistId',
            as: 'subs',
          },
        },
        {
          $addFields: {
            subscribersCount: { $size: '$subs' },
          },
        },
        { $project: { subs: 0 } },
        { $sort: { subscribersCount: -1, createdAt: -1, _id: -1 } },
        { $skip: pagination.offset },
        { $limit: pagination.limit },
      ]),
      this.playlistModel.countDocuments(visibilityMatch),
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

  async search(
    query: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponse<Playlist>> {
    const pagination = this.resolvePagination(limit, offset);
    const normalizedQuery = query.trim();
    const searchByName = { name: { $regex: new RegExp(normalizedQuery, 'i') } };
    const filter = { $and: [{ isPublic: true }, searchByName] };

    const [items, total] = await Promise.all([
      this.playlistModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'playlistsubscriptions',
            localField: '_id',
            foreignField: 'playlistId',
            as: 'subs',
          },
        },
        {
          $addFields: {
            subscribersCount: { $size: '$subs' },
          },
        },
        { $project: { subs: 0 } },
        { $sort: { subscribersCount: -1, createdAt: -1, _id: -1 } },
        { $skip: pagination.offset },
        { $limit: pagination.limit },
      ]),
      this.playlistModel.countDocuments(filter),
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

  async isUserSubscribed(
    playlistId: string,
    userId: string,
  ): Promise<{ isSubscribed: boolean }> {
    const existingSubscription = await this.playlistSubscriberModel.exists({
      playlistId,
      userId,
    });

    return { isSubscribed: !!existingSubscription };
  }

  async toggleTrackInPlaylist(
    dto: ToggleTrackInPlaylistDto,
  ): Promise<{ included: boolean }> {
    const playlist = await this.playlistModel.findById(dto.playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    const existingTrack = await this.playlistTrackModel.findOne({
      playlistId: dto.playlistId,
      trackId: dto.trackId,
    });

    if (!existingTrack) {
      const last = await this.playlistTrackModel
        .findOne({ playlistId: dto.playlistId })
        .sort({ position: -1 });

      const position = last ? last.position + 1 : 1;

      await this.playlistTrackModel.create({
        playlistId: dto.playlistId,
        trackId: dto.trackId,
        position,
      });
    }

    if (existingTrack) {
      await this.playlistTrackModel.deleteOne({
        playlistId: dto.playlistId,
        trackId: dto.trackId,
      });
    }

    return { included: !existingTrack };
  }

  async subscribe(dto: SubscribeOnPlaylistDto, userId: string): Promise<void> {
    const playlist = await this.playlistModel.findById(dto.playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    const existingSubscription = await this.playlistSubscriberModel.findOne({
      userId,
      playlistId: dto.playlistId,
    });

    if (existingSubscription) {
      await this.playlistSubscriberModel.deleteOne({
        playlistId: dto.playlistId,
        userId,
      });
    }

    if (!existingSubscription) {
      await this.playlistSubscriberModel.create({
        playlistId: dto.playlistId,
        userId,
      });
    }
  }

  async fork(dto: forkDto, userId: string): Promise<{ playlistId: string }> {
    const originPlaylist = await this.playlistModel.findById(dto.playlistId);

    if (!originPlaylist) {
      throw new NotFoundException('Not found origin playlist');
    }

    const originPlaylistTracks = await this.playlistTrackModel.find({
      playlistId: dto.playlistId,
    });

    const baseName = `Fork ${originPlaylist.name}`;

    const count = await this.playlistModel.countDocuments({
      ownerId: userId,
      name: new RegExp(`^${baseName}`),
    });

    const forkName = count === 0 ? baseName : `${baseName} (${count + 1})`;

    const forkPlaylist = await this.playlistModel.create({
      isPublic: originPlaylist.isPublic,
      name: forkName,
      type: PlaylistType.FORK,
      ownerId: userId,
      originalPlaylistId: dto.playlistId,
      pictureUrl: originPlaylist.pictureUrl,
    });

    await this.playlistSubscriberModel.create({
      playlistId: forkPlaylist._id.toString(),
      userId,
    });

    if (originPlaylistTracks.length) {
      await this.playlistTrackModel.insertMany(
        originPlaylistTracks.map((t) => ({
          playlistId: forkPlaylist._id.toString(),
          trackId: t.trackId,
          position: t.position,
        })),
      );
    }

    return { playlistId: forkPlaylist._id.toString() };
  }

  async edit(
    dto: EditPlaylistDto,
    picture: MulterFile | undefined,
    userId: string,
  ): Promise<void> {
    const updateData: Record<string, any> = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );

    let newPictureUrl: string | undefined;

    if (picture) {
      newPictureUrl = await this.minioService.putObject(
        picture,
        MinioBucket.PLAYLISTS,
      );
      updateData.pictureUrl = newPictureUrl;
    }

    const playlist = await this.playlistModel.findOneAndUpdate(
      { _id: dto.playlistId, ownerId: userId },
      { $set: updateData },
      { new: true },
    );

    if (!playlist) {
      throw new NotFoundException(
        'Playlist not found or you are not the owner',
      );
    }

    if (picture && playlist.pictureUrl) {
      await this.minioService.deleteObject(
        playlist.pictureUrl,
        MinioBucket.PLAYLISTS,
      );
    }
  }

  async delete(playlistId: string, userId: string): Promise<{ id: string }> {
    const playlist = await this.playlistModel.findById(playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.ownerId.toString() !== userId) {
      throw new ForbiddenException('Удалять плейлист может только владелец');
    }

    await this.playlistSubscriberModel.deleteMany({ playlistId });
    await this.playlistTrackModel.deleteMany({ playlistId });
    await this.playlistModel.findByIdAndDelete(playlistId);

    if (playlist.pictureUrl) {
      await this.minioService.deleteObject(playlist.pictureUrl, MinioBucket.PLAYLISTS);
    }

    return { id: playlistId };
  }
}
