import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true, type: mongoose.Schema.ObjectId, ref: 'Track' })
  trackId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.index({ trackId: 1, userId: 1 }, { unique: true });
