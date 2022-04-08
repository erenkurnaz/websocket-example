import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { MessageRepository } from '../../domain/message/message.repository';
import { AuthSocket, IMessagePayload, ISocketUser, WsEvents } from '../types';
import { SocketStateService } from '../redis/socket-state.service';
import { Types } from 'mongoose';
import { UserDocument } from '../../domain/user/user.entity';
import { UserRepository } from '../../domain/user/user.repository';

@WebSocketGateway({
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly socketStateService: SocketStateService,
    private readonly userRepository: UserRepository,
  ) {}

  @SubscribeMessage(WsEvents.MESSAGE)
  async handleMessage(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() message: string,
  ): Promise<IMessagePayload> {
    if (!message || !socket.user.friends.length) return;

    await this.emitEventToFriends(socket, WsEvents.MESSAGE, {
      message,
      username: socket.user.name,
      createdAt: new Date(),
    });

    await this.messageRepository.create({
      message,
      sender: new Types.ObjectId(socket.user._id),
    });
  }

  async handleConnection(socket: AuthSocket) {
    socket.emit(
      WsEvents.UNSEEN_MESSAGES,
      await this.getUnseenMessages(socket.user),
    );

    await this.emitEventToFriends(socket, WsEvents.CONNECTED, {
      message: `${socket.user.name} connected now.`,
      username: socket.user.name,
      createdAt: new Date(),
    });
  }

  async handleDisconnect(socket: AuthSocket): Promise<void> {
    await this.userRepository.updateLastSeen(socket.user._id);

    await this.emitEventToFriends(socket, WsEvents.DISCONNECTED, {
      message: `${socket.user.name} disconnected now.`,
      username: socket.user.name,
      createdAt: new Date(),
    });
    await this.socketStateService.remove(socket.user._id);
  }

  private async emitEventToFriends(
    socket: AuthSocket,
    event: WsEvents,
    payload: IMessagePayload,
  ) {
    const socketIs = await this.socketStateService.getFriendSocketIds(
      socket.user._id,
    );

    socket.to(socketIs).emit(event, payload);
  }

  private async getUnseenMessages(
    user: ISocketUser,
  ): Promise<IMessagePayload[]> {
    const unseenMessages = await this.messageRepository.findUnseenMessages(
      user.friends,
      user.lastSeen,
    );

    if (!unseenMessages) return [];

    return unseenMessages.map((message) => {
      const sender = message.sender as UserDocument;
      return {
        message: message.message,
        username: sender.name,
        createdAt: message.createdAt,
      };
    });
  }
}
