import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { CreatePlaylistDto } from './dto/createPlaylist.dto';
import { AddTrackToPlaylistDto } from './dto/addTrackToPlaylist.dto';
import { SubscribeOnPlaylistDto } from './dto/subscribeOnPlaylist.dto';
import { UnsubscribeOnPlaylistDto } from './dto/unsubscribe.dto';
import { forkDto } from './dto/fork.dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreatePlaylistDto) {
    return this.playlistsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add/track')
  async addTrackToPlaylist(@Body() dto: AddTrackToPlaylistDto) {
    return this.playlistsService.addTrackToPlaylist(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/subscribe')
  async subscripeOnPlaylist(@Body() dto: SubscribeOnPlaylistDto) {
    return this.playlistsService.subscribe(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async unsubscribe(@Body() dto: UnsubscribeOnPlaylistDto) {
    return this.playlistsService.unsubscribe(dto);
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
}
