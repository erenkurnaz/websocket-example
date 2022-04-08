import { User } from '../../domain/user/user.entity';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDto implements Pick<User, 'email' | 'password'> {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
