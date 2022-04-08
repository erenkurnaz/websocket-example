import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { IConfig } from '../../config/configuration';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../../domain/user/user.entity';
import { JwtPayload } from '../strategies/passport-jwt.strategy';

export type SanitizedPayload = Pick<UserDocument, '_id' | 'email'>;

@Injectable()
export class TokenService {
  private readonly jwtOptions: JwtSignOptions;

  constructor(
    private readonly config: ConfigService<IConfig>,
    private readonly jwtService: JwtService,
  ) {
    this.jwtOptions = {
      secret: this.config.get('jwtSecret'),
      ...this.config.get('jwtSignOptions'),
    };
  }

  public sign(payload: SanitizedPayload): string {
    return this.jwtService.sign(payload);
  }

  public verify(token: string): SanitizedPayload {
    return this.jwtService.verify(token);
  }

  public async verifyAsync(token: string): Promise<JwtPayload> {
    return await this.jwtService.verifyAsync(token);
  }
}
