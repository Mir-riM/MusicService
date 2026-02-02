import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RegisterDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../guards/auth.guard';
import { JwtPayload } from '../jwt/types/jwtPayload';

export interface AuthRequest extends Request {
  user: JwtPayload;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: AuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(dto, req);

    res.cookie('refreshToken', tokens.refresh, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    res.cookie('jwtAccessToken', tokens.access, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return user;
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(dto, req);

    res.cookie('refreshToken', tokens.refresh, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    res.cookie('jwtAccessToken', tokens.access, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return user;
  }

  @Post('refresh')
  async access(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    console.log(refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const result = await this.authService.refresh(refreshToken, req);

    res.cookie('refreshToken', result.refresh, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.cookie('jwtAccessToken', result.access, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    res.status(200);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: AuthRequest) {
    return this.authService.me(req.user.id);
  }

  @Post('/logout')
  async logout(@Res() res: Response) {
    res.clearCookie('refreshToken');
    res.clearCookie('jwtAccessToken');
  }
}
