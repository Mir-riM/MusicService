import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export enum PlaylistType {
  SYSTEM = 'system',
  FORK = 'fork',
  USER = 'user',
}

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  isPublic: boolean;
  @Prop({
    required: true,
    type: String,
    enum: PlaylistType,
    default: PlaylistType.USER,
  })
  type: PlaylistType;
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  ownerId: mongoose.Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' })
  originalPlaylistId?: mongoose.Types.ObjectId;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);

PlaylistSchema.index({ ownerId: 1, name: 1 }, { unique: true });
