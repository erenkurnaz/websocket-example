import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IConfig } from '../config/configuration';
import { TokenService } from './services/jwtoken.service';
import { JwtStrategy } from './strategies/passport-jwt.strategy';
import { UserModule } from '../domain/user/user.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<IConfig>) => ({
        secret: config.get('jwtSecret'),
        signOptions: config.get('jwtSignOptions'),
      }),
    }),
    UserModule,
  ],
  providers: [TokenService, JwtStrategy],
  exports: [TokenService],
})
export class SecurityModule {}
