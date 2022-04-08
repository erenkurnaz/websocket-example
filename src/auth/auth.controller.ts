import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserLoginDto } from './dto/user-login.dto';
import { TokenService } from '../security/services/jwtoken.service';
import { UserDocument } from '../domain/user/user.entity';
import { UserRepository } from '../domain/user/user.repository';
import { errorMessages } from '../error/error-messages';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async signIn(@Body() { email, password }: UserLoginDto) {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) throw new UnauthorizedException(errorMessages.USER_NOT_FOUND);

    const result = await user.validatePassword(password);
    if (!result) throw new UnauthorizedException(errorMessages.USER_NOT_FOUND);

    return {
      user: this.omitPassword(user),
      token: this.tokenService.sign({
        _id: user._id,
        email: user.email,
      }),
    };
  }

  private omitPassword(UserDocument: UserDocument) {
    const user = UserDocument.toObject();
    delete user.password;

    return user;
  }
}
