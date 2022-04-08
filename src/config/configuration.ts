import { JwtSignOptions } from '@nestjs/jwt';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export interface IConfig {
  mode: string;
  jwtSecret: string;
  jwtSignOptions: JwtSignOptions;
  mongodb: MongooseModuleOptions;
  redisHost: string;
}

export default (): IConfig => ({
  mode: process.env.MODE || 'dev',
  jwtSecret: process.env.JWT_SECRET || 'mostsecurejwtsecret',
  jwtSignOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    algorithm: 'HS256',
  },
  mongodb: {
    uri: process.env.MONGO_HOST
      ? `mongodb://${process.env.MONGO_HOST}:27017`
      : 'mongodb://localhost:27017',
    dbName: process.env.DB_NAME || 'websocket-example-test',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  redisHost: process.env.REDIS_HOST || 'localhost',
});
