import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entity';
import { compare } from '../common/utils';
import { JwyPayloadInfo } from './type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async validateUserLocal(username: string, plainPassword: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username, true);

    if (!user) {
      throw new BadRequestException('用户名不正确！');
    }

    // 密码比对
    if (!compare(plainPassword, user.password)) {
      throw new BadRequestException('密码不正确！');
    }

    // 此处先将password显式删除，然后再返回，避免密码泄露！！！
    delete user.password;

    return user;
  }

  // 生成JWT
  private createToken(jwyPayloadInfo: JwyPayloadInfo) {
    return this.jwtService.sign(jwyPayloadInfo);
  }

  public signIn(user: Partial<User>) {
    const token = this.createToken({
      sub: `${user.id}`,
      username: user.username,
    });

    return {
      id: user.id,
      username: user.username,
      token,
    };
  }
}
