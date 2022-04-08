import {
  addFriend,
  createUser,
  ITUser,
  UserBuilder,
} from '../../utils/user.helper';

describe('User Helper', () => {
  let USER: ITUser;
  let USER_2: ITUser;

  beforeAll(async () => {
    [USER, USER_2] = await Promise.all([
      createUser(UserBuilder.iUser().build()),
      createUser(UserBuilder.iUser().build()),
    ]);
  });

  test('should create user', async () => {
    const itUser = UserBuilder.iUser().build();
    const user = await createUser(itUser);

    expect(user).toBeDefined();
    expect(user.email).toEqual(itUser.email);
  });

  test('should add friends both', async () => {
    const [user, user_2] = await addFriend(USER._id, USER_2._id);

    expect(user.email).toEqual(USER.email);
    expect(user.friends[0]).toEqual(USER_2._id);

    expect(user_2.email).toEqual(USER_2.email);
    expect(user_2.friends[0]).toEqual(USER._id);
  });
});
