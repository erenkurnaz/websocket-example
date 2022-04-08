import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../../src/domain/user/user.repository';
import { MessageRepository } from '../../src/domain/message/message.repository';
import { ConfigService } from '@nestjs/config';
import { IConfig } from '../../src/config/configuration';
import { RedisIoAdapter } from '../../src/websocket/redis/redis-io.adapter';

export let app: INestApplication;

const init = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  const configService = app.get<ConfigService<IConfig>>(ConfigService);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(configService.get('redisHost'));

  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(3001);
};

export const resetDatabase = async () => {
  const userRepository = app.get<UserRepository>(UserRepository);
  const messageRepository = app.get<MessageRepository>(MessageRepository);

  await Promise.all([
    userRepository.clearCollection(),
    messageRepository.clearCollection(),
  ]);
};

export function getEndpoint() {
  return 'http://localhost:3001';
}

beforeAll(async () => {
  await init();
  await resetDatabase();
});

afterAll(async () => {
  await app.close();
});
