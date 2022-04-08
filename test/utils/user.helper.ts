import faker from '@faker-js/faker';
import { Builder } from './builder.helper';
import * as request from 'supertest';
import { app } from './app.helper';
import { UserRepository } from '../../src/domain/user/user.repository';
import { UserDocument } from '../../src/domain/user/user.entity';
import { TokenService } from '../../src/security/services/jwtoken.service';

export interface ITUser {
  _id: string;
  email: string;
  password: string;
  name?: string;
  surname?: string;
  friends: string[];
  lastSeen: Date;
}

export class UserBuilder extends Builder<ITUser> {
  constructor() {
    super({
      _id: '',
      name: faker.name.findName(),
      surname: faker.name.findName(),
      email: faker.internet.exampleEmail(),
      password: faker.internet.password(12),
      friends: [],
      lastSeen: new Date(),
    });
  }
  static iUser() {
    return new UserBuilder();
  }
}

export async function addFriend(
  userId: string,
  friendId: string,
): Promise<ITUser[]> {
  try {
    const userRepository = app.get<UserRepository>(UserRepository);
    const [user, friend] = await userRepository.addToFriends(userId, friendId);

    return [mapUserDocument(user), mapUserDocument(friend)];
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function createUser({
  email,
  password,
  name,
  surname,
  friends,
  lastSeen,
}: ITUser): Promise<ITUser> {
  const userRepository = app.get<UserRepository>(UserRepository);
  const createdUser = await userRepository.create({
    email,
    password,
    name,
    surname,
    friends,
    lastSeen,
  });

  return mapUserDocument(createdUser);
}

export function createToken({ _id, email }: ITUser): string {
  const tokenService = app.get<TokenService>(TokenService);

  return tokenService.sign({ _id, email });
}

export function verifyToken(token: string) {
  const tokenService = app.get<TokenService>(TokenService);

  return tokenService.verify(token);
}

const mapUserDocument = ({
  _id,
  email,
  name,
  surname,
  friends,
  lastSeen,
}: UserDocument): ITUser => {
  return UserBuilder.iUser()
    .with('_id', typeof _id === 'string' ? _id : _id.toHexString())
    .with('email', email)
    .with('name', name)
    .with('surname', surname)
    .with(
      'friends',
      friends?.length ? friends.map((id) => id.toHexString()) : [],
    )
    .with('lastSeen', lastSeen)
    .build();
};
