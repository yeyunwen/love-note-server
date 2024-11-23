import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import GLOBAL_CONFIG from '../common/config';
import { JwtPayload } from '../common/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: GLOBAL_CONFIG.AUTH_CONFIG.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return { ...payload };
  }
}
