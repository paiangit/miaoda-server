import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserController],
  // 注意此处不要忘记把UserService注册进来，否则会报如下错误：
  // Error: Nest can't resolve dependencies of the AppController(?).
  // Please make sure that the argument AppService at index[0]
  // is available in the AppModule context.
  providers: [UserService],
  exports: [],
})
export class UserModule {
}
