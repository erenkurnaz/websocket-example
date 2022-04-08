import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { WsException } from '@nestjs/websockets';
import { INestApplication } from '@nestjs/common';
import { AuthSocket, NextFunction } from '../types';
import { errorMessages } from '../../error/error-messages';
import { TokenService } from '../../security/services/jwtoken.service';
import { UserRepository } from '../../domain/user/user.repository';
import { SocketStateService } from './socket-state.service';

export class RedisIoAdapter extends IoAdapter {
  private readonly tokenService: TokenService;
  private readonly userRepository: UserRepository;
  private readonly socketStateService: SocketStateService;
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(private readonly app: INestApplication) {
    super(app);
    this.tokenService = this.app.get<TokenService>(TokenService);
    this.userRepository = this.app.get<UserRepository>(UserRepository);
    this.socketStateService =
      this.app.get<SocketStateService>(SocketStateService);
  }

  async connectToRedis(redisHost: string): Promise<void> {
    const pubClient = createClient({
      socket: {
        host: redisHost,
        port: 6379,
      },
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    server.use(async (socket: AuthSocket, next) => {
      try {
        const token = socket.handshake.query.token;
        if (!token) this.handleError(socket, next, errorMessages.UNAUTHORIZED);

        const decoded = await this.tokenService.verifyAsync(token as string);
        const user = await this.userRepository.findByEmail(decoded.email);

        socket.user = SocketStateService.mapUserDocument(user);
        await this.socketStateService.add(user.id, socket);

        next();
      } catch (e) {
        this.handleError(socket, next, errorMessages.INVALID_TOKEN);
      }
    });
    return server;
  }

  private handleError(
    socket: AuthSocket,
    next: NextFunction,
    errorMessage: string,
  ) {
    socket.disconnect();
    next(new WsException(errorMessage));
  }
}
