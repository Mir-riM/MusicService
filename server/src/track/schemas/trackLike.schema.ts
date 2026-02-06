import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TrackLikeDocument = HydratedDocument<TrackLike>;

@Schema()
export class TrackLike {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  trackId: string;
}

export const TrackLikeSchema = SchemaFactory.createForClass(TrackLike);

TrackLikeSchema.index({ userId: 1, trackId: 1 }, { unique: true });
