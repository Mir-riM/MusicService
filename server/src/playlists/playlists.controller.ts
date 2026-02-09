import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { CreatePlaylistDto } from './dto/createPlaylist.dto';
import { AddTrackToPlaylistDto } from './dto/addTrackToPlaylist.dto';
import { SubscribeOnPlaylistDto } from './dto/subscribeOnPlaylist.dto';
import { forkDto } from './dto/fork.dto';
import { EditPlaylistDto } from './dto/editPlaylist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from '../track/dto/createTrack.dto';
import { DeleteTrackFromPlaylist } from './dto/removeTrackFromPlaylist';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('picture'))
  async create(
    @UploadedFile() picture: MulterFile | undefined,
    @Body() dto: CreatePlaylistDto,
  ) {
    return this.playlistsService.create(dto, picture);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add/track')
  async addTrackToPlaylist(@Body() dto: AddTrackToPlaylistDto) {
    return this.playlistsService.addTrackToPlaylist(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/track')
  async removeTrackFromPlaylist(@Body() dto: DeleteTrackFromPlaylist) {
    return this.playlistsService.deleteTrackFromPlaylist(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/subscribe')
  async subscribe(@Body() dto: SubscribeOnPlaylistDto) {
    return this.playlistsService.subscribe(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/fork')
  async fork(@Body() dto: forkDto) {
    return this.playlistsService.fork(dto);
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.playlistsService.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/:id')
  async getPlaylistsBySubscriber(@Param('id') userId: string) {
    return this.playlistsService.getPlaylistsBySubscriber(userId);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  @Patch('/edit')
  async editPlaylist(
    @UploadedFile() picture: MulterFile | undefined,
    @Body() dto: EditPlaylistDto,
  ) {
    const data = {
      ...dto,
      isPublic: String(dto?.isPublic) === 'true',
    };

    return this.playlistsService.edit(data, picture);
  }
}
