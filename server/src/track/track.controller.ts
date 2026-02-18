import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { createTrackDto } from './dto/createTrack.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { TrackLikeDto } from './dto/trackLike.dto';
import { MulterFile } from '../common/types/multer.types';
import type { AuthRequest } from '../common/types/authRequest';
import { PaginationQueryDto } from '../common/dto/paginationQuery.dto';

@Controller('/tracks')
export class TrackController {
  constructor(private trackService: TrackService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'picture',
          maxCount: 1,
        },
        {
          name: 'track',
          maxCount: 1,
        },
      ],
      {
        limits: {
          fileSize: 100 * 1024 * 1024,
        },
      },
    ),
  )
  create(
    @Req() req: AuthRequest,
    @UploadedFiles()
    files: {
      track: MulterFile[];
      picture: MulterFile[];
    },
    @Body() dto: createTrackDto,
  ) {
    const { picture, track } = files;

    return this.trackService.create(dto, picture[0], track[0], req.user.id);
  }

  @Get('all')
  getAll(@Query() query: PaginationQueryDto) {
    return this.trackService.getAll(query.limit, query.offset);
  }

  @Get('/search')
  search(@Query('query') query: string, @Query() pagination: PaginationQueryDto) {
    return this.trackService.search(query, pagination.limit, pagination.offset);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.trackService.getOne(id);
  }

  // в будущем нужно сделать, чтобы удалять мог
  // только тот кто опубликовал трек или модератор
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.trackService.delete(id, req.user.id, req.user.roles);
  }

  // по идее можно сделать api запрос который срабатывает после завершения прослушивания
  // добавляя песню в историю, увеличивая ей прослушивание и так далее
  @Post(':id/listen')
  listen(@Param('id') trackId: string) {
    return this.trackService.listen(trackId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/like')
  async like(@Req() req: AuthRequest, @Body() dto: TrackLikeDto) {
    return await this.trackService.toggleLike(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/like/links/me')
  async getLikeLinks(@Req() req: AuthRequest) {
    return await this.trackService.getLikeLinks(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/like/me')
  async getLikeTracks(@Req() req: AuthRequest, @Query() query: PaginationQueryDto) {
    return await this.trackService.getLikeTracks(
      req.user.id,
      query.limit,
      query.offset,
    );
  }
}
