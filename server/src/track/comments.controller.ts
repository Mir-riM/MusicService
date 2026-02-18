import { Body, Controller, Delete, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import type { AuthRequest } from '../common/types/authRequest';
import { CommentsService } from './comments.service';
import { CreateTrackCommentDto } from './dto/createTrackComment.dto';
import { UpdateTrackCommentDto } from './dto/updateTrackComment.dto';

@Controller('/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateTrackCommentDto) {
    return this.commentsService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') commentId: string,
    @Req() req: AuthRequest,
    @Body() dto: UpdateTrackCommentDto,
  ) {
    return this.commentsService.update(commentId, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') commentId: string, @Req() req: AuthRequest) {
    return this.commentsService.remove(commentId, req.user.id);
  }
}
