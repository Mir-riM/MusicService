import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Date, HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User> & {
  _id: Types.ObjectId;
  roles: UserRole[];
};

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  login: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER] })
  roles: UserRole[];
}

export const UserSchema = SchemaFactory.createForClass(User);
