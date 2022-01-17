# miaoda-server



## 初始化项目

```
nest new miaoda-server
pnpm install
pnpm start:debug
```

这样就可以通过http://localhost:3000来访问了。

pnpm的使用参见：https://pnpm.io/zh/pnpm-cli。

## 如何调试

使用pnpm start:debug启动应用的情况下，支持进行调试。

先到Chrome浏览器下通过访问chrome://inspect/#pages，找到对应的页面（比如：http://localhost:3000/api/v1/user/list?pageSize=30&offset=0）点击inspect进行调试。

进去之后，打开Chrome DevTools，然后点击其中六边形的那个Node.js图标，进到Node.js调试面板，然后切换到Source选显卡。

然后找到你所要调试的文件进行断点，注意应该是dist目录下的文件，而不是src目录下的文件。如果你选src目录下的文件进行断点，会发现根本不起作用。

### 初步理解初始化得到的项目

初始化得到的应用程序的入口是src/main.ts，它里面主要做的事情就是使用NestFactory.create(AppModule)来创建了一个Nest应用实例，这个实例监听了3000端口。

> const app = await NestFactory.create(AppModule);

关于这个应用，首先有三个概念你必须理解：

模块：所谓模块，就是功能域。NestJS通过模块来把一个大的应用划分成若干个模块，然后把这些挂载到根模块上，从而组成应用程序。app.module.ts就是应用程序的根模块。

从实现上来说，模块是用@Module()装饰器来装饰的一个类。@Module({
  controllers: xxx,
  providers: xxx,
  imports: xxx,
  exports: xxx
})。

@Module装饰器接收的对象包含四个常用属性：providers、controllers、imports、exports。

controllers：用于分发和处理http请求和响应，请求过来后，controller会把它分发给对应的服务提供者去进行具体业务逻辑的处理，这些服务提供者我们叫它一个个的provider；

providers：服务提供者，负责处理具体的业务逻辑，比如添加用户、删除用户等等；

imports：导入服务的列表，如果当前模块需要使用其他模块的服务，就需要通过这里导入；

exports：导出服务的列表，供其它模块导入使用。如果希望当前模块下的服务可以被其他模块共享，需要在这里配置导出；

## 给路由添加/api/v1/前缀

```ts
app.setGlobalPrefix('/api/v1/');
```

这样就可以通过 http://localhost:3000/api/v1 来访问了。

## 实现一个User模块

### user/user.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ){}

  // 创建用户
  @Post('create')
  create(@Body() createUserInfo) {
    return this.userService.create(createUserInfo);
  }

  // 删除用户
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // 查询用户列表
  @Get('list')
  list(
    @Query('pageSize') pageSize: number,
    @Query('offset') offset: number,
  ) {
    return this.userService.list(pageSize, offset);
  }

  // 按id查询用户信息
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // 更新用户的信息
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserInfo) {
    return this.userService.update(id, updateUserInfo);
  }
}
```

### user/user.service.ts
```ts
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
```

### user/user.module.ts
```ts
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
```

### 把UserModule注册到app.module.ts的imports中：

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

经过上面的步骤，我们就可以用Postman来测试这些接口了：

创建用户：
GET
http://localhost:3000/api/v1/user/create

删除用户：
DELETE
http://localhost:3000/api/v1/user/:id

更新用户信息：
PUT
http://localhost:3000/api/v1/user/:id

查询用户列表：
GET
http://localhost:3000/api/v1/user/list?pageSize=xxx&offset=yyy

按id查询用户信息：
GET
http://localhost:3000/api/v1/user/:id


## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm start

# watch mode
$ pnpm start:dev

# production mode
$ pnpm start:prod
```

## Test

```bash
# unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# test coverage
$ pnpm test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
