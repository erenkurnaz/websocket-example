import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

export interface AuthSocket extends Socket {
  user: ISocketUser;
}

export type NextFunction = (error?: ExtendedError) => void;

export enum WsEvents {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  MESSAGE = 'message',
  UNSEEN_MESSAGES = 'unseen_messages',
}

export interface ISocketUser {
  _id: string;
  name: string;
  surname: string;
  friends: string[];
  lastSeen: Date;
}

export interface IMessagePayload {
  username: string;
  message: string;
  createdAt: Date;
}
