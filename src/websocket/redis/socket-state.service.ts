import { AuthSocket, ISocketUser } from '../types';
import { UserDocument } from '../../domain/user/user.entity';
import { Types } from 'mongoose';
import { RedisClientType } from 'redis';
import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.provider';

@Injectable()
export class SocketStateService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClientType,
  ) {}

  public async remove(userId: string): Promise<void> {
    const existSocket = this.get(userId);

    if (!existSocket) return;

    await this.redisClient.del(userId);
  }

  public async add(userId: string, socket: AuthSocket): Promise<void> {
    await this.redisClient.set(
      userId,
      JSON.stringify({ socketId: socket.id, user: socket.user }),
    );
  }

  public async get(
    userId: string,
  ): Promise<{ socketId: string; user: ISocketUser } | null> {
    const user = await this.redisClient.get(userId);

    return JSON.parse(user);
  }

  public async getFriendSocketIds(userId: string): Promise<string[]> {
    const result = await this.get(userId);

    if (!result) return;

    const friendSocketIds = [];
    for (const friendId of result.user.friends) {
      const result = await this.get(friendId);
      if (result && result.socketId) friendSocketIds.push(result.socketId);
    }

    return friendSocketIds;
  }

  static mapUserDocument(userDocument: UserDocument): ISocketUser {
    return {
      _id: userDocument.id,
      name: userDocument.name,
      surname: userDocument.surname,
      lastSeen: userDocument.lastSeen,
      friends: userDocument.friends.map((friendId) => {
        return friendId && friendId instanceof Types.ObjectId
          ? friendId.toHexString()
          : friendId;
      }),
    };
  }
}
