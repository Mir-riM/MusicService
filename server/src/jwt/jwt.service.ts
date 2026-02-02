import { Injectable } from '@nestjs/common';
import { UserDocument, UserRole } from '../auth/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  createAccessToken(id: string, role: UserRole[]) {
    const payload = {
      sub: id,
      roles: role,
    };

    return this.jwtService.sign(payload);
  }
}
