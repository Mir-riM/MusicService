import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
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
import { MulterFile } from '../common/types/multer.types';
import type { AuthRequest } from '../common/types/authRequest';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('picture'))
  async create(
    @Req() req: AuthRequest,
    @UploadedFile() picture: MulterFile | undefined,
    @Body() dto: CreatePlaylistDto,
  ) {
    return this.playlistsService.create(dto, picture, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/toggle/track')
  async toggleTrackInPlaylist(@Body() dto: ToggleTrackInPlaylistDto) {
    return this.playlistsService.toggleTrackInPlaylist(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/subscribe')
  async subscribe(@Req() req: AuthRequest, @Body() dto: SubscribeOnPlaylistDto) {
    return this.playlistsService.subscribe(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/fork')
  async fork(@Req() req: AuthRequest, @Body() dto: forkDto) {
    return this.playlistsService.fork(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  @Patch('/edit')
  async editPlaylist(
    @Req() req: AuthRequest,
    @UploadedFile() picture: MulterFile | undefined,
    @Body() dto: EditPlaylistDto,
  ) {
    const data = {
      ...dto,
      isPublic: String(dto?.isPublic) === 'true',
    };

    return this.playlistsService.edit(data, picture, req.user.id);
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.playlistsService.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/me')
  async getPlaylistsBySubscriber(@Req() req: AuthRequest) {
    return this.playlistsService.getPlaylistsBySubscriber(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/track/link/me')
  async getPlaylistTrackLink(@Req() req: AuthRequest) {
    return await this.playlistsService.getPlaylistTrackLink(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deletePlaylist(@Req() req: AuthRequest, @Param('id') playlistId: string) {
    return this.playlistsService.delete(playlistId, req.user.id);
  }
}
