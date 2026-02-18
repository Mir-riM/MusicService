import type { Request } from 'express';
import { JwtPayload } from '../../jwt/types/jwtPayload';

export interface AuthRequest extends Request {
  user: JwtPayload;
}
