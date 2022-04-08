import { createClient } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const client = createClient({
      socket: {
        host: config.get('redisHost'),
        port: 6379,
      },
    });
    await client.connect();
    return client;
  },
  provide: REDIS_CLIENT,
};
