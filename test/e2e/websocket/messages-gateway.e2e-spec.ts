import { Socket } from 'socket.io-client';
import {
  addFriend,
  createToken,
  createUser,
  ITUser,
  UserBuilder,
} from '../../utils/user.helper';
import {
  createSocket,
  ClientEvents,
  ITSocketMessage,
} from '../../utils/socket.helper';
import { errorMessages } from '../../../src/error/error-messages';

describe('WebSocketGateway', () => {
  let WS: Socket;
  let WS2: Socket;
  let WS_USER: ITUser;
  let WS2_USER: ITUser;

  beforeAll(async () => {
    const user1 = await createUser(UserBuilder.iUser().build());
    const user2 = await createUser(UserBuilder.iUser().build());

    [WS_USER, WS2_USER] = await addFriend(user1._id, user2._id);
  });

  afterAll(() => {
    WS.close();
    WS2.close();
  });

  test('should throw unauthorized error', async () => {
    const unauthorizedSocket = await createSocket();

    await new Promise<void>((resolve) => {
      unauthorizedSocket.on(ClientEvents.CONNECT_ERROR, (error) => {
        expect(error.message).toEqual(errorMessages.UNAUTHORIZED);
        resolve();
      });
    });
  });

  test('should throw invalid token error', async () => {
    const unauthorizedSocket = await createSocket('invalid_token');

    await new Promise<void>((resolve) => {
      unauthorizedSocket.on(ClientEvents.CONNECT_ERROR, (error) => {
        expect(error.message).toEqual(errorMessages.INVALID_TOKEN);
        resolve();
      });
    });
  });

  test('should first socket init', async () => {
    const token = createToken(WS_USER);
    WS = await createSocket(token);

    await new Promise<void>((resolve) =>
      WS.on(ClientEvents.CONNECT, () => {
        expect(WS.connected).toEqual(true);
        resolve();
      }),
    );
  });

  test('should second socket init', async () => {
    const token = createToken(WS2_USER);
    WS2 = await createSocket(token);

    await new Promise<void>((resolve) => {
      WS2.on(ClientEvents.CONNECT, () => {
        expect(WS2.connected).toEqual(true);
        resolve();
      });
    });
  });

  test(`should handle message`, async () => {
    WS2.emit(ClientEvents.MESSAGE, 'hello');
    await new Promise<void>((resolve) => {
      WS.on(
        ClientEvents.MESSAGE,
        ({ message, username, createdAt }: ITSocketMessage) => {
          expect(message).toEqual('hello');
          expect(username).toEqual(WS2_USER.name);
          expect(createdAt).toBeDefined();
          resolve();
        },
      );
    });
  });

  test(`should receive disconnected notification`, async () => {
    WS2.disconnect();
    await new Promise<void>((resolve) => {
      WS.on(
        ClientEvents.DISCONNECTED,
        ({ message, username, createdAt }: ITSocketMessage) => {
          expect(message).toEqual(
            `${username} ${ClientEvents.DISCONNECTED} now.`,
          );
          expect(username).toEqual(WS2_USER.name);
          expect(createdAt).toBeDefined();
          resolve();
        },
      );
    });
  });

  test(`should receive connected notification`, async () => {
    WS2.connect();
    await new Promise<void>((resolve) => {
      WS.on(
        ClientEvents.CONNECTED,
        ({ message, username, createdAt }: ITSocketMessage) => {
          expect(message).toEqual(`${username} ${ClientEvents.CONNECTED} now.`);
          expect(username).toEqual(WS2_USER.name);
          expect(createdAt).toBeDefined();
          resolve();
        },
      );
    });
  });

  test('should receive unseen messages', async () => {
    let ws2 = WS2.disconnect();
    WS.emit(ClientEvents.MESSAGE, 'Offline message.');
    WS.emit(ClientEvents.MESSAGE, 'Offline message 2.');

    await new Promise<void>((resolve) => {
      ws2 = ws2.connect();
      ws2.on(ClientEvents.CONNECT, () => {
        expect(ws2.connected).toEqual(true);
        ws2.on(ClientEvents.UNSEEN_MESSAGES, (payload: ITSocketMessage[]) => {
          expect(payload.length).toEqual(2);
          expect(payload[0].message).toEqual('Offline message.');
          expect(payload[0].username).toEqual(WS_USER.name);
          expect(payload[0].createdAt).toBeDefined();
          resolve();
        });
      });
    });
  });
});
