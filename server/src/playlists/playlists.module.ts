import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';
import {
  PlaylistTracks,
  PlaylistTracksSchema,
} from './schemas/playlistTracks.schema';
import {
  PlaylistSubscription,
  PlaylistSubscriptionSchema,
} from './schemas/playlistSubscription.schema';

@Module({
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  imports: [
    MongooseModule.forFeature([
      { name: Playlist.name, schema: PlaylistSchema },
      { name: PlaylistTracks.name, schema: PlaylistTracksSchema },
      { name: PlaylistSubscription.name, schema: PlaylistSubscriptionSchema },
    ]),
  ],
})
export class PlaylistsModule { }
