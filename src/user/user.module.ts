import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity';

@Module({
  imports: [
    // 使用 forFeature([User]) 方法定义在当前范围中注册哪些存储库。
    // 这样，我们就可以使用 @InjectRepository()装饰器将
    // UsersRepository 注入到 UsersService 中
    // 如果不设置这一项，会报如下错误：
    // Nest can't resolve dependencies of the UserService (?, +).
    // Please make sure that the argument at index [0]
    // is available in the current context
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  // 注意此处不要忘记把UserService注册进来，否则会报如下错误：
  // Error: Nest can't resolve dependencies of the AppController(?).
  // Please make sure that the argument AppService at index[0]
  // is available in the AppModule context.
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
