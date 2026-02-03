import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { createTrackDto, MulterFile } from './dto/create-track.dto';
import type { ObjectId } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/auth.guard';

@Controller('/tracks')
export class TrackController {
  constructor(private trackService: TrackService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'picture',
        maxCount: 1,
      },
      {
        name: 'track',
        maxCount: 1,
      },
    ]),
  )
  create(
    @UploadedFiles()
    files: {
      track: MulterFile;
      picture: MulterFile;
    },
    @Body() dto: createTrackDto,
  ) {
    const { picture, track } = files;

    return this.trackService.create(dto, picture[0], track[0]);
  }

  @Get('all')
  getAll(@Query('count') count: number, @Query('offset') offset: number) {
    return this.trackService.getAll(count, offset);
  }

  @Get('/search')
  search(@Query('query') query: string) {
    return this.trackService.search(query);
  }

  @Get(':id')
  getOne(@Param('id') id: ObjectId) {
    return this.trackService.getOne(id);
  }

  // в будущем нужно сделать, чтобы удалять мог
  // только тот кто опубликовал трек или модератор
  @Delete(':id')
  delete(@Param('id') id: ObjectId) {
    return this.trackService.delete(id);
  }

  @Post('/comment')
  createComment(@Body() dto: CreateCommentDto) {
    return this.trackService.createComment(dto);
  }

  // по идее можно сделать api запрос который срабатывает после завершения прослушивания
  // добавляя песню в историю, увеличивая ей прослушивание и так далее
  @Post(':id')
  listen(@Param('id') trackId: string) {
    return this.trackService.listen(trackId);
  }
}
