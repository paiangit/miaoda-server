import { Injectable, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { compare } from '../common/utils';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(username: string, plainPassword: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username, true);

    if (!user) {
      throw new BadRequestException('用户名不正确！');
    }

    // 密码比对
    if (compare(plainPassword, user.password)) {
      throw new BadRequestException('密码不正确！');
    }

    // 此处先将password显式删除，然后再返回，避免密码泄露！！！
    delete user.password;

    return user;
  }
}
