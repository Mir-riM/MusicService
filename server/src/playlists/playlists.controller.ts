import {
  Body,
  Controller,
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
import { ToggleTrackInPlaylistDto } from './dto/toggleTrackInPlaylistDto.dto';
import { SubscribeOnPlaylistDto } from './dto/subscribeOnPlaylist.dto';
import { forkDto } from './dto/fork.dto';
import { EditPlaylistDto } from './dto/editPlaylist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from '../track/dto/createTrack.dto';

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
  @Post('/toggle/track')
  async toggleTrackInPlaylist(@Body() dto: ToggleTrackInPlaylistDto) {
    return this.playlistsService.toggleTrackInPlaylist(dto);
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
  @Get(':id/track/link')
  async getPlaylistTrackLink(@Param('id') userId: string) {
    return await this.playlistsService.getPlaylistTrackLink(userId);
  }
}
