import { Module } from '@nestjs/common';
import { MessagesGateway } from './gateways/messages.gateway';
import { UserModule } from '../domain/user/user.module';
import { SecurityModule } from '../security/security.module';
import { MessageModule } from '../domain/message/message.module';
import { redisProvider } from './redis/redis.provider';
import { ConfigModule } from '@nestjs/config';
import { SocketStateService } from './redis/socket-state.service';

@Module({
  imports: [UserModule, SecurityModule, MessageModule, ConfigModule],
  providers: [MessagesGateway, redisProvider, SocketStateService],
  exports: [MessagesGateway],
})
export class WebsocketModule {}
