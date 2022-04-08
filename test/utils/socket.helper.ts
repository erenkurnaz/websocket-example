import * as io from 'socket.io-client';
import { getEndpoint } from './app.helper';

export enum ClientEvents {
  CONNECT = 'connect',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  MESSAGE = 'message',
  UNSEEN_MESSAGES = 'unseen_messages',
  CONNECT_ERROR = 'connect_error',
}

export interface ITSocketMessage {
  message: string;
  username: string;
  createdAt: Date;
}

export function createSocket(token?: string) {
  return new Promise<io.Socket>((resolve) => {
    const options = {
      transports: ['websocket'],
      query: {},
      multiplex: false,
      forceNew: true,
    };
    if (token) options.query['token'] = token;

    const socket = io.io(getEndpoint(), options);

    resolve(socket);
  });
}
