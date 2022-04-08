import * as request from 'supertest';
import {
  createToken,
  createUser,
  ITUser,
  UserBuilder,
  verifyToken,
} from '../../utils/user.helper';
import { app } from '../../utils/app.helper';

describe('Authentication (e2e)', () => {
  const PASSWORD = '123456';
  let USER: ITUser;

  beforeEach(async () => {
    USER = await createUser(
      UserBuilder.iUser().with('password', PASSWORD).build(),
    );
  });

  test('/auth/login (POST)', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: USER.email, password: PASSWORD })
      .expect(200)
      .expect((response) => {
        const { user, token } = response.body;

        expect(token).toBeDefined();
        expect(user.email).toEqual(user.email);
      });
  });

  test('should token create and verify', () => {
    const token = createToken(USER);
    expect(token).toBeDefined();

    const decoded = verifyToken(token);
    expect(decoded).toMatchObject({ _id: USER._id, email: USER.email });
  });
});
