import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PlaylistSubscriptionDocument =
  HydratedDocument<PlaylistSubscription>;

@Schema({ timestamps: true })
export class PlaylistSubscription {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;
  @Prop({ required: true, type: 'ObjectId', ref: 'Playlist' })
  playlistId: string;
}

export const PlaylistSubscriptionSchema =
  SchemaFactory.createForClass(PlaylistSubscription);

PlaylistSubscriptionSchema.index(
  { userId: 1, playlistId: 1 },
  { unique: true },
);
