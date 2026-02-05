import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Playlist, PlaylistDocument } from './schemas/playlist.schema';
import { Model } from 'mongoose';
import { CreatePlaylistDto } from './dto/createPlaylist.dto';
import { PlaylistTracks } from './schemas/playlistTracks.schema';
import { PlaylistSubscription } from './schemas/playlistSubscription.schema';
import { AddTrackToPlaylistDto } from './dto/addTrackToPlaylist.dto';
import { SubscribeOnPlaylistDto } from './dto/subscribeOnPlaylist.dto';
import { UnsubscribeOnPlaylistDto } from './dto/unsubscribe.dto';

export interface PlaylistWithTracks extends Playlist {
  tracks: PlaylistTracks[];
}

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectModel(Playlist.name) private playlistSchema: Model<PlaylistDocument>,
    @InjectModel(PlaylistTracks.name)
    private playlistTrackSchema: Model<PlaylistTracks>,
    @InjectModel(PlaylistSubscription.name)
    private playlistSubscriberSchema: Model<PlaylistSubscription>,
  ) {}

  async create(dto: CreatePlaylistDto): Promise<Playlist> {
    const playlist = await this.playlistSchema.create(dto);

    await this.playlistSubscriberSchema.create({
      userId: dto.ownerId,
      playlistId: playlist._id.toString(),
    });

    return playlist;
  }

  async getOne(id: string): Promise<PlaylistWithTracks> {
    const playlist = await this.playlistSchema.findById(id);

    console.log('Playlist id:', id);

    const playlistTracks = await this.playlistTrackSchema
      .find({ playlistId: id })
      .sort({ position: 1 })
      .populate('trackId');

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    return { ...playlist.toObject(), tracks: playlistTracks };
  }

  async getPlaylistsBySubscriber(userId: string): Promise<Playlist[]> {
    const playlistSubscriptions = await this.playlistSubscriberSchema.find({
      userId,
    });

    console.log(userId, playlistSubscriptions);

    const playlistIds = playlistSubscriptions.map((ps) => ps.playlistId);

    const playlists = await this.playlistSchema.find({
      _id: { $in: playlistIds },
    });

    return playlists;
  }

  async addTrackToPlaylist(
    dto: AddTrackToPlaylistDto,
  ): Promise<PlaylistWithTracks> {
    const playlist = await this.playlistSchema.findById(dto.playlistId);

    const playlistTracks = await this.playlistTrackSchema
      .find({ playlistId: dto.playlistId })
      .sort({ position: 1 })
      .populate('trackId');

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    await this.playlistTrackSchema.create(dto, {
      position: playlistTracks.length + 1,
    });

    return { ...playlist.toObject(), tracks: playlistTracks };
  }

  async subscribe(dto: SubscribeOnPlaylistDto): Promise<void> {
    const existingSubscription = await this.playlistSubscriberSchema.findOne({
      userId: dto.userId,
      playlistId: dto.playlistId,
    });

    if (existingSubscription) {
      throw new Error('Already subscribed');
    }

    await this.playlistSubscriberSchema.create(dto);
  }

  async unsubscribe(dto: UnsubscribeOnPlaylistDto) {
    const playlist = await this.playlistSchema.findById(dto.userId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    const playlistSubscribers = await this.playlistSubscriberSchema.find({
      playlistId: dto.playlistId,
    });

    if (playlistSubscribers.length === 1) {
      await this.playlistSubscriberSchema.deleteMany({
        playlistId: dto.playlistId,
      });
      await this.playlistTrackSchema.deleteMany({ playlistId: dto.playlistId });
      await this.playlistSchema.findByIdAndDelete(dto.playlistId);
    }

    if (playlistSubscribers.length > 1) {
      await this.playlistSubscriberSchema.deleteOne({
        playlistId: dto.playlistId,
        userId: dto.userId,
      });
    }
  }
}
