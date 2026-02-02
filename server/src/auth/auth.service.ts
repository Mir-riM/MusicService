import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto, RegisterDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { JwtAuthService } from '../jwt/jwt.service';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh.schema';
import type { Request } from 'express';
import { hashRefreshToken } from '../utils/createRefresh';
import * as uuid from 'uuid';

export type Tokens = {
  access: string;
  refresh: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenSchema: Model<RefreshTokenDocument>,
    private jwtAuthService: JwtAuthService,
  ) {}

  async login(
    dto: AuthDto,
    req: Request,
  ): Promise<{ user: User; tokens: Tokens }> {
    try {
      const user = await this.userSchema.findOne({ login: dto.login });

      if (!user) {
        throw new HttpException(
          'Неверный логин или пароль',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const compareHash = await bcrypt.compare(dto.password, user.passwordHash);

      if (!compareHash) {
        throw new HttpException(
          'Неверный логин или пароль',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const refreshToken = crypto.randomBytes(64).toString('hex');
      const refreshTokenHash = hashRefreshToken(refreshToken);

      const expiresAt = new Date(
        Date.now() +
          Number(process.env.REFRESH_TOKEN_EXPIRES_AT) * 24 * 60 * 60 * 1000,
      );

      await this.refreshTokenSchema.create({
        userId: user._id.toString(),
        tokenHash: refreshTokenHash,
        expiresAt: expiresAt,
        userAgent: req.get('user-agent'),
        revoked: false,
      });

      const accessToken = this.jwtAuthService.createAccessToken(
        user.id,
        user.roles,
      );

      return {
        user,
        tokens: { access: accessToken, refresh: refreshToken },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async register(
    dto: RegisterDto,
    req: Request,
  ): Promise<{ user: User; tokens: Tokens }> {
    try {
      const newUserId = uuid.v4();
      const newUserRole = [UserRole.USER];
      const passwordHash = await bcrypt.hash(dto.password, 10);

      const refreshToken = crypto.randomBytes(64).toString('hex');
      const refreshTokenHash = hashRefreshToken(refreshToken);

      const expiresAt = new Date(
        Date.now() +
          Number(process.env.REFRESH_TOKEN_EXPIRES_AT) * 24 * 60 * 60 * 1000,
      );

      await this.refreshTokenSchema.create({
        userId: newUserId,
        tokenHash: refreshTokenHash,
        expiresAt: expiresAt,
        userAgent: req.get('user-agent'),
        revoked: false,
      });

      const accessToken = this.jwtAuthService.createAccessToken(
        newUserId,
        newUserRole,
      );

      const user = await this.userSchema.create({
        login: dto.login,
        passwordHash,
        roles: newUserRole,
      });

      return {
        user,
        tokens: { access: accessToken, refresh: refreshToken },
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException(
          'Пользователь с таким логином уже существует',
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        'Ошибка при создании пользователя',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async refresh(refreshToken: string, req: Request): Promise<Tokens> {
    try {
      const refreshTokenHash = hashRefreshToken(refreshToken);

      const storedToken = await this.refreshTokenSchema.findOne({
        tokenHash: refreshTokenHash,
        revoked: false,
      });

      if (!storedToken) {
        throw new UnauthorizedException();
      }

      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException();
      }

      if (storedToken.userAgent !== req.get('user-agent')) {
        throw new UnauthorizedException();
      }

      const user = await this.userSchema.findById(storedToken.userId);

      if (!user) {
        throw new UnauthorizedException();
      }

      storedToken.revoked = true;

      await storedToken.save();

      const newRefreshToken = crypto.randomBytes(64).toString('hex');
      const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

      await this.refreshTokenSchema.create({
        userId: user._id.toString(),
        tokenHash: newRefreshTokenHash,
        expiresAt: new Date(
          Date.now() +
            Number(process.env.REFRESH_TOKEN_EXPIRES_AT) * 24 * 60 * 60 * 1000,
        ),
        userAgent: req.get('user-agent'),
        revoked: false,
      });

      const accessToken = this.jwtAuthService.createAccessToken(
        user.id,
        user.roles,
      );

      return {
        access: accessToken,
        refresh: newRefreshToken,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async me(userId: string): Promise<User> {
    try {
      const user = await this.userSchema.findById(userId);

      if (!user) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
