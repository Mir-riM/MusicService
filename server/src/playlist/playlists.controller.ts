import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-auth.guard';
import { CreatePlaylistDto } from './dto/createPlaylist.dto';
import { ToggleTrackInPlaylistDto } from './dto/toggleTrackInPlaylistDto.dto';
import { SubscribeOnPlaylistDto } from './dto/subscribeOnPlaylist.dto';
import { forkDto } from './dto/fork.dto';
import { EditPlaylistDto } from './dto/editPlaylist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from '../common/types/multer.types';
import type { AuthRequest } from '../common/types/authRequest';
import { PaginationQueryDto } from '../common/dto/paginationQuery.dto';
import type { Request } from 'express';
import type { JwtPayload } from '../jwt/types/jwtPayload';

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

  @UseGuards(OptionalJwtAuthGuard)
  @Get('/popular')
  async getPopular(
    @Req() req: Request & { user?: JwtPayload },
    @Query() query: PaginationQueryDto,
  ) {
    return this.playlistsService.getPopular(
      query.limit,
      query.offset,
      req.user?.id,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('/search')
  async search(
    @Req() req: Request & { user?: JwtPayload },
    @Query('query') query: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.playlistsService.search(
      query,
      pagination.limit,
      pagination.offset,
      req.user?.id,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('/:id')
  async getOne(
    @Req() req: Request & { user?: JwtPayload },
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.playlistsService.getOne(id, query.limit, query.offset, req.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/subscription/me')
  async getSubscriptionStatus(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.playlistsService.isUserSubscribed(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/me')
  async getPlaylistsBySubscriber(
    @Req() req: AuthRequest,
    @Query() query: PaginationQueryDto,
  ) {
    return this.playlistsService.getPlaylistsBySubscriber(
      req.user.id,
      query.limit,
      query.offset,
    );
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
