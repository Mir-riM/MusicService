import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PlaylistTracksDocument = HydratedDocument<PlaylistTracks>;

@Schema()
export class PlaylistTracks {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
  })
  playlistId: mongoose.Types.ObjectId;
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Track' })
  trackId: mongoose.Types.ObjectId;
  @Prop({ required: true, default: 0 })
  position: number;
  @Prop({ required: true, default: Date.now })
  addedAt: Date;
}

export const PlaylistTracksSchema =
  SchemaFactory.createForClass(PlaylistTracks);

PlaylistTracksSchema.index({ playlistId: 1, trackId: 1 }, { unique: true });
PlaylistTracksSchema.index({ playlistId: 1, position: 1 });
