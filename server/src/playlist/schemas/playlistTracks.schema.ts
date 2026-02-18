import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Track } from '../../track/schemas/track.schema';

export type PlaylistTracksDocument = HydratedDocument<PlaylistTracks>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
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

  track?: Track;
}

export const PlaylistTracksSchema =
  SchemaFactory.createForClass(PlaylistTracks);

PlaylistTracksSchema.virtual('track', {
  ref: 'Track',
  localField: 'trackId',
  foreignField: '_id',
  justOne: true,
});

PlaylistTracksSchema.index({ playlistId: 1, trackId: 1 }, { unique: true });
PlaylistTracksSchema.index({ playlistId: 1, position: 1 });
