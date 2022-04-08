import { Module } from '@nestjs/common';
import { UserModule } from '../domain/user/user.module';
import { AuthController } from './auth.controller';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [UserModule, SecurityModule],
  controllers: [AuthController],
})
export class AuthModule {}
