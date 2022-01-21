import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super(
      {
        usernameField: 'username',
        passwordField: 'password',
      } as IStrategyOptions
    );
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUserLocal(username, password);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误！');
    }

    return user;
  }
}
