import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Track, TrackDocument } from './schemas/track.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { CreateTrackCommentDto } from './dto/createTrackComment.dto';
import { UpdateTrackCommentDto } from './dto/updateTrackComment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateTrackCommentDto, userId: string): Promise<Comment> {
    const track = await this.trackModel.findById(dto.trackId);
    if (!track) {
      throw new NotFoundException('Трек не найден');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const existingComment = await this.commentModel.findOne({
      trackId: dto.trackId,
      userId,
    });
    if (existingComment) {
      throw new ConflictException({
        code: 'COMMENT_ALREADY_EXISTS',
        message: 'Вы уже оставляли комментарий к этому треку',
      });
    }

    const comment = await this.commentModel.create({
      username: user.login,
      text: dto.text,
      trackId: new mongoose.Types.ObjectId(dto.trackId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    track.comments.push(comment._id);
    await track.save();

    return comment;
  }

  async update(
    commentId: string,
    dto: UpdateTrackCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    if (!comment.userId) {
      throw new ForbiddenException('Комментарий нельзя редактировать');
    }

    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('Нельзя редактировать чужой комментарий');
    }

    comment.text = dto.text;
    await comment.save();

    return comment;
  }

  async remove(commentId: string, userId: string): Promise<{ id: string }> {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    if (!comment.userId) {
      throw new ForbiddenException('Комментарий нельзя удалить');
    }

    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('Нельзя удалять чужой комментарий');
    }

    await this.commentModel.deleteOne({ _id: commentId });
    await this.trackModel.updateOne(
      { _id: comment.trackId },
      { $pull: { comments: comment._id } },
    );

    return { id: commentId };
  }
}
