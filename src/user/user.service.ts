import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  public create(createUserInfo) {
    return `create user succeed, ${JSON.stringify(createUserInfo)}`;
  }

  public remove(id: string) {
    return `remove succeed, id: ${id}`;
  }

  public update(id: string, updateUserInfo) {
    return `update succeed, id: ${id}, updateUserInfo: ${JSON.stringify(updateUserInfo)}`;
  }

  public findOne(id: string) {
    return `a user, id: ${id}`;
  }

  public list(pageSize: number, offset: number) {
    return `user list, pageSize: ${pageSize}, offset: ${offset}`;
  }
}
