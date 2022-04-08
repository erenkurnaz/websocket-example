import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IConfig } from '../../config/configuration';
import { SanitizedPayload } from '../services/jwtoken.service';
import { UserRepository } from '../../domain/user/user.repository';

export interface JwtPayload extends SanitizedPayload {
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<IConfig>,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    const userDocument = await this.userRepository.findById(payload._id);
    if (!userDocument) throw new UnauthorizedException();

    const user = userDocument.toObject();
    delete user.password;

    return user;
  }
}
