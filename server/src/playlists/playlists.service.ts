import { Injectable, NotFoundException } from '@nestjs/common';
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
import { MulterFile } from '../track/dto/createTrack.dto';

export interface PlaylistWithTracks extends Playlist {
  tracks: PlaylistTracks[];
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
  ) {}

  async create(
    dto: CreatePlaylistDto,
    picture: MulterFile | undefined,
  ): Promise<Playlist> {
    let pictureUrl: string | undefined;

    if (picture) {
      pictureUrl = await this.minioService.putObject(
        picture,
        MinioBucket.PLAYLISTS,
      );
    }

    const playlist = await this.playlistModel.create({ ...dto, pictureUrl });

    await this.playlistSubscriberModel.create({
      userId: dto.ownerId,
      playlistId: playlist._id.toString(),
    });

    return playlist;
  }

  async getOne(id: string): Promise<PlaylistWithTracks> {
    const playlist = await this.playlistModel.findById(id);

    const playlistTracks = await this.playlistTrackModel
      .find({ playlistId: id })
      .sort({ position: 1 })
      .populate('track');

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    return { ...playlist.toObject(), tracks: playlistTracks };
  }

  async getPlaylistsBySubscriber(userId: string): Promise<Playlist[]> {
    const playlistSubscriptions = await this.playlistSubscriberModel.find({
      userId,
    });

    const playlistIds = playlistSubscriptions.map((ps) => ps.playlistId);

    const playlists = await this.playlistModel.find({
      _id: { $in: playlistIds },
    });

    return playlists;
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

  async subscribe(dto: SubscribeOnPlaylistDto): Promise<void> {
    const playlist = await this.playlistModel.findById(dto.playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    const existingSubscription = await this.playlistSubscriberModel.findOne({
      userId: dto.userId,
      playlistId: dto.playlistId,
    });

    if (existingSubscription) {
      const playlistSubscribers = await this.playlistSubscriberModel.find({
        playlistId: dto.playlistId,
      });

      if (playlistSubscribers.length === 1) {
        await this.playlistSubscriberModel.deleteMany({
          playlistId: dto.playlistId,
        });
        await this.playlistTrackModel.deleteMany({
          playlistId: dto.playlistId,
        });
        await this.playlistModel.findByIdAndDelete(dto.playlistId);
      }

      if (playlistSubscribers.length > 1) {
        await this.playlistSubscriberModel.deleteOne({
          playlistId: dto.playlistId,
          userId: dto.userId,
        });
      }
    }

    if (!existingSubscription) {
      await this.playlistSubscriberModel.create(dto);
    }
  }

  async fork(dto: forkDto): Promise<{ playlistId: string }> {
    const originPlaylist = await this.playlistModel.findById(dto.playlistId);

    if (!originPlaylist) {
      throw new NotFoundException('Not found origin playlist');
    }

    const originPlaylistTracks = await this.playlistTrackModel.find({
      playlistId: dto.playlistId,
    });

    const baseName = `Fork ${originPlaylist.name}`;

    const count = await this.playlistModel.countDocuments({
      ownerId: dto.userId,
      name: new RegExp(`^${baseName}`),
    });

    const forkName = count === 0 ? baseName : `${baseName} (${count + 1})`;

    const forkPlaylist = await this.playlistModel.create({
      isPublic: originPlaylist.isPublic,
      name: forkName,
      type: PlaylistType.FORK,
      ownerId: dto.userId,
      originalPlaylistId: dto.playlistId,
      pictureUrl: originPlaylist.pictureUrl,
    });

    await this.playlistSubscriberModel.create({
      playlistId: forkPlaylist._id.toString(),
      userId: dto.userId,
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
      { _id: dto.playlistId, ownerId: dto.userId },
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
}
