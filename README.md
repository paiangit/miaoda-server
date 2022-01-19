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
### Chrome Devtools中断点调试

使用pnpm start:debug启动应用的情况下，支持进行调试。

先到Chrome浏览器下通过访问chrome://inspect/#pages，找到对应的页面（比如：http://localhost:3000/api/v1/user/list?pageSize=30&offset=0）点击inspect进行调试。

进去之后，打开Chrome DevTools，然后点击其中六边形的那个Node.js图标，进到Node.js调试面板，然后切换到Source选显卡。

然后找到你所要调试的文件进行断点，注意应该是dist目录下的文件，而不是src目录下的文件。如果你选src目录下的文件进行断点，会发现根本不起作用。

### VSCode中调试

cmd+shift+p 然后输入Configure Task，然后选择该项(Tasks: Configure Task)，即会自动生成.vscode/task.json文件。

```json
{
	"version": "2.0.0",
	"tasks": [
    {
      "type": "npm",
      "script": "start:debug",
      "group": "rebuild",
      "problemMatcher": [],
      "label": "npm: start:debug",
      "detail": "nest start --debug --watch"
    }
  ]
}
```

然后添加.vscode/launch.json文件。

```json
{
  // 使用 IntelliSense 了解相关属性。
  // 悬停以查看现有属性的描述。
  // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "pwa-node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "program": "${file}"
    }
  ]
}
```
然后就可以在VSCode中断点调试了。注意需要在main.ts上有断点先直接断住才行，否则一运行马上就结束了。

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

## 给路由添加/api/v1前缀

```ts
app.setGlobalPrefix('/api/v1');
```

这样就可以通过 http://localhost:3000/api/v1 来访问了。

## 实现一个User模块

### 控制层：user/user.controller.ts
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
import {
  CreateUserDto,
  UpdateUserDto,
  PaginationRequestDto,
  PaginationResultDto,
} from './dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ){}

  // 创建用户
  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // 删除用户
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // 查询用户列表
  @Get('list')
  list(
    @Query() PaginationRequestDto: PaginationRequestDto,
  ): Promise<PaginationResultDto> {
    const PAGE_SIZE_LIMIT = 50;

    return this.userService.list({
      ...PaginationRequestDto,
      pageSize: Math.min(PAGE_SIZE_LIMIT, PaginationRequestDto.pageSize),
    });
  }

  // 按id查询用户信息
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // 更新用户的信息
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
}
```

### 服务层：user/user.service.ts
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

### 模块层：user/user.module.ts
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

当然，也可以通过nest-cli提供的命令来创建模块、控制器、服务等。语法是：

```sh
nest g [文件类型] [文件名] [文件目录]
```

可以通过nest generate --help来查看帮助。

前面我们创建文件都是一个个创建的，其实还有一个快速创建Contoller、Service、Module以及DTO文件的方式:

```sh
nest g resource <模块名>
```

这样就快速的创建了一个REST API的模块，里面简单的CRUD代码都已经实现好了。

### 注册到根模块：把UserModule注册到app.module.ts的imports中：

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

## 准备数据库

启动MySQL数据库服务：

```sh
net start mysql
```

然后创建一个数据库：

```sh
mysql -u root
```

```sh
SHOW DATABASES;
```

你Navicat for MySQL连接MySQL，创建一个数据库miaoda，并将“数据库属性”中的字符集设置成：utf8mb4。另外创建一个user表，同样将其字符集设置成utf8mb4。

## 配置ORM，连接数据库

### 安装ORM及校验相关依赖：

```sh
pnpm add --save @nestjs/typeorm typeorm mysql2 class-validator class-transformer
```

### DTO层：处理客户端参数

上面，我们获取客户端的参数是直接写在控制器内的方法的参数中的，而且是每个参数分开来写（如下所示）：

```ts
// 查询用户列表
@Get('list')
list(
  @Query('pageSize') pageSize: number,
  @Query('offset') offset: number,
) {
  return this.userService.list(pageSize, offset);
}
```

这样带来的问题是：

当多个方法都都需要传入相同参数时，要写很多重复代码，可维护性大大降低；
参数的有效性验证需要写在控制器内的方法中，会产生冗余代码；
一大串参数写在方法里不太优雅。

DTO层的作用就是为解决上述问题而引入的。DTO即数据传输对象，有点像interface，目标是传输数据并验证它，主要用于路由器/控制器。

为什么不使用 interface 而要使用DTO这样的 class 来定义呢？我们都知道Typescript接口在编译过程中是会被删除的，其次后面我们要给参数加说明，使用Swagger的装饰器，而interface也是无法实现的。所以我们这里必须使用Dto这样的class。

对于上面的参数，我们可以创建一个user/dto/pagination.dto.ts来管理它：

```ts
import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationRequestDto {
  // 因为地址栏中的参数取出来之后是字符串类型的，
  // 所以需要先用class-transformer的Type先转成数字，再去用IsInt校验
  // 否则就直接校验不通过了
  @Min(1)
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  pageSize: number; // 每页数据条数

  @Min(0)
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  offset: number; // 从哪条记录开始请求
}
```

注意，因为地址栏中的参数取出来之后是字符串类型的，所以需要先用class-transformer的Type先转成数字，再去用IsInt校验。否则就连正常情况也直接校验不通过了。

不过要注意，DTO本身是不存在任何验证功能的。但是我们可以借助class-validator来让DTO可以验证数据。

### 添加 app.useGlobalPipes(new ValidationPipe()) 支持校验

要让上面的@IsInt、@IsNotEmpty等装饰器的校验生效，需要在main.ts中增加如下两行代码：

```ts
  import { NestFactory } from '@nestjs/core';
+ import { ValidationPipe } from '@nestjs/common';
  import { AppModule } from './app.module';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // 能进行请求参数验证、请求接口地址有效性验证
+   app.useGlobalPipes(new ValidationPipe());
    // 添加路由前缀
    app.setGlobalPrefix('/api/v1');
    await app.listen(3000);
  }
  bootstrap();
```

类验证器：

https://docs.nestjs.cn/8/pipes?id=%e7%b1%bb%e9%aa%8c%e8%af%81%e5%99%a8

class-validator 这个优秀的库允许您使用基于装饰器的验证。装饰器的功能非常强大，尤其是与 Nest 的 Pipe 功能相结合使用时，因为我们可以通过访问 metatype 信息做很多事情，记得在开始之前需要安装下面这两个依赖。

```sh
yarn add --save class-validator class-transformer
```

### 管道

管道是具有 @Injectable() 装饰器的类。管道应实现 PipeTransform 接口。

上面的ValidationPipe就是一个管道。

管道有两个类型:

转换：管道将输入数据转换为所需的数据输出

验证：对输入数据进行验证，如果验证成功继续传递; 如果验证失败则抛出异常。

通俗来讲就是，对请求接口的入参进行验证和转换的前置操作，验证通过了之后才会将内容给到路由对应的方法中去，如果验证失败了就进入异常过滤器中。

Nest.js自带了三个开箱即用的管道：ValidationPipe、ParseIntPipe和ParseUUIDPipe, 其中ValidationPipe 配合class-validator就可以完美的实现对参数类型进行验证，验证失败抛出异常的效果，这是上面已经介绍过了的。

### entity层：

user/entity/user.entity.ts

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { DateEntity } from '../../common/entity';

import {
  UserStatus,
  Gender,
} from '../type';

@Entity('user')
export class User extends DateEntity {
  @PrimaryGeneratedColumn({
    comment: '用户编号',
    type: 'int',
  })
  id: number;

  @Column({
    name: 'work_id',
    comment: '工号',
    type: 'char',
    length: 7,
    nullable: true,
    unique: true,
  })
  workId: string;

  @Column({
    comment: '用户名',
    type: 'varchar',
    length: 14,
    nullable: false,
    unique: true,
  })
  username: string;

  // select 控制隐藏列
  // 如果要查询的模型具有"select：false"的列，则需要使用addSelect函数来从列中检索信息。
  // .addSelect("user.password")
  @Column({
    comment: '密码',
    select: false,
    type: 'varchar',
    length: 14,
    nullable: false,
  })
  password: string;

  @Column({
    comment: '手机号码',
    type: 'char',
    length: 11,
    nullable: true,
  })
  phone: string;

  @Column({
    comment: '邮箱',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  email: string;

  @Column({
    comment: '性别',
    type: 'tinyint',
    nullable: true,
    default: 0,
  })
  gender: Gender;

  @Column({
    comment: '头像',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  avatar: string;

  @Column({
    comment: '用户状态',
    type: 'tinyint',
    nullable: false,
    default: 1,
  })
  status: UserStatus;
}
```

关于其中的PrimaryGeneratedColumn，可参见《typeorm装饰器之PrimaryGeneratedColumn》一文：https://blog.csdn.net/qq_27868061/article/details/79018786。

因为created_at和updated_at两个字段很多entity都要用到，所以单独抽成一个基类：

common/entity/date.entity.ts

```ts
import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class DateEntity {
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    // CURRENT_TIMESTAMP(precision)返回包含当前的时区信息的 TIMESTAMP WITH TIME ZONE 数据类型。
    // permission是精度，可取值0-9。
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updatedAt: Date;
}
```

这样，这两个值将分别在创建和更新时进行更新成当前时间戳。

注意这里有个驼峰转下划线命名的问题。因为数据库字段名通常是用_连接的命名方式，而JavaScript代码中，通常是用驼峰命名的方式，怎么让两者各得其所呢？就是像下面第二行和第六行那样。

```ts
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updatedAt: Date;
```

更多关于Typeorm 字段名驼峰转下划线命名的问题，可参考：
https://www.jianshu.com/p/c8d3ba63e03c

修改时区的办法如下：

1）仅修改当前会话的时区，停止会话失效

```sql
set time_zone = '+8:00';
```

2）修改全局的时区配置

```sql
set global time_zone = '+8:00';
flush privileges;
```

flush privileges是重新加载权限、更新权限的意思，意思是刷新MySQL的系统权限相关表。

### 连接数据库

创建config/ormconfig.dev.ts：

```ts
export default {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'miaoda',
  logging: true,
  timezone: '+08:00', // 服务器上配置的时区
  // 设置为true将自动加载项目中每一个通过forFeature()注册了的实体，
  // 将它们自动添加到配置对象的entities数组中,
  // forFeature()就是在某个service中的imports里面引入的
  // 采用这种方式，就不用在这里配置entities选项了，更加自动化
  autoLoadEntities: true,
  // 警告！！！
  // 生产环境下面这个选项一定要设置成false，否则会很容易造成你的数据被覆盖或被清除的情况
  // 测试环境建议不要用，因为很容易导致辛辛苦苦建立的测试数据丢失
  // 功能：根据实体自动创建数据库表
  synchronize: true,
  // retryAttempts: 10, // 重试连接数据库的次数（默认：10）
  // retryDelay: 3000, // 两次重试连接的间隔(ms)（默认：3000）
  // autoLoadEntities: false, // 如果为true, 将自动加载实体(默认：false)
  // keepConnectionAlive: false, // 如果为true，在应用程序关闭后连接不会关闭（默认：false)
};
```

其中，关于entity的引入，推荐用autoLoadEntities: true这个选项，而不是entities:[...]这个选项。因为autoLoadEntities: true将自动加载项目中每一个通过forFeature()注册了的实体，将它们自动添加到配置对象的entities数组中。采用这种方式，更加自动化，而且不容易匹配错。

如果有某个用到的entity没有引入，会报如下错误：

> No repository for "User" was found. Looks like this entity is notregistered in current "default" connection?

特别值得注意的是，synchronize: true这个选项，当这个选项设置为true时，对于entity的修改会自动同步到数据库中，一不小心就会导致数据丢失。比如，对于avatar字段原本是varchar类型，长度100，你现在把长度改成200，就会导致数据库中avatar列的所有数据丢失。同样，如果你修改数据类型也会导致同样的结果。

配置好config/ormconfig.dev.ts之后，在app.module.ts中:

```ts
import { TypeOrmModule } from '@nestjs/typeorm';
```

并在imports增加TypeOrmModule.forRoot(ormConfig)：

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import OrmConfig from './config/ormconfig.dev';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(OrmConfig as any),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

当然，除了这种方式以外，也可以通过在根目录放置ormconfig.json，供自动读取；或者通过编写环境变量文件再结合@nestjs/config的方式（基于https://www.npmjs.com/package/dotenv）。

### 查询

在上面的user/user.controller.ts中，涉及到两个查询路由的处理，一个是按id查询用户信息，一个是分页查询用户列表。

```
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ){}

  // 分页查询用户列表
  @Get('list')
  list(
    @Query() PaginationRequestDto: PaginationRequestDto,
  ): Promise<PaginationResultDto> {
    const PAGE_SIZE_LIMIT = 50;

    return this.userService.list({
      ...PaginationRequestDto,
      pageSize: Math.min(PAGE_SIZE_LIMIT, PaginationRequestDto.pageSize),
    });
  }

  // 按id查询用户信息
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
```

这里用到了存储库模式（https://docs.nestjs.cn/8/techniques?id=%e5%ad%98%e5%82%a8%e5%ba%93%e6%a8%a1%e5%bc%8f），InjectRepository，

对于存储库，首先需要在Module中使用 forFeature([User]) 方法定义在当前范围中注册哪些存储库。

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

这样，我们就可以使用 @InjectRepository() 装饰器将 UsersRepository 注入到 UsersService 中。
在user/user.service.ts中对应的实现是：

```ts
import { HttpException, Injectable, Query } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUserDto,
  UpdateUserDto,
  PaginationRequestDto,
  PaginationResultDto,
} from './dto';
import { User } from './entity/user.entity';
import { UserStatus } from './type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}
  // 按id查询用户
  public findOne(id: string) {
    return this.usersRepository.findOne({ id: +id });
  }

  // 查找所有用户
  public async list(@Query() PaginationRequestDto: PaginationRequestDto): Promise<PaginationResultDto> {
    const totalCount = await this.usersRepository.count();
    let offset;
    let pageSize;

    try {
      offset = parseInt(PaginationRequestDto.offset, 10);
      pageSize = parseInt(PaginationRequestDto.pageSize, 10);
    } catch(err) {
      throw new HttpException('请求参数错误', 401);
    }

    const users = await this.usersRepository.createQueryBuilder('user') // 参数'user'是别名
      .where('user.status != :status', { status: -1 }) // 选择状态不等于-1（被删除）的元素，这里的user用的就是上一行中定义的别名
      .orderBy('created_at', 'DESC') // 降序排列，注意这里传入的数据库字段中的名字，所以是created_at而不是createdAt
      .skip(offset) // 跳过多少前面页的数据
      .take(pageSize) // 最多获取pageSize条数据
      .getMany();

    return {
      data: users,
      totalCount,
      offset: offset + users.length,
      pageSize,
    };
  }
}
```

这样，我们就得到了this.usersRepository，然后就可以通过它去进行增删改查操作了。要注意，this.usersRepository上的方法都是异步操作的，所以前面别忘记加await。

分页查询这里用到了this.usersRepository的createQueryBuilder方法，关于createQueryBuilder的使用参见：

https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md

在进行分页查询接口的设计的时候，我们设计了两个参数：pageSize和offset，pageSize是偏移量。然后每次请求时，服务器从便宜量位置开始取。

注意 skip + take 与 offset + limit 的区别：

当查询中存在连接或子查询时，skip + take 的方式总是能正确的返回数据，而 offset + limit 返回的数据并不是我们期望的那样。所以查询分页数据时，应该使用 skip + take。

参考：https://github.com/dzzzzzy/Nestjs-Learning/blob/master/issues/typeorm/pagination/README.md#skip--take-%E4%B8%8E-offset--limit-%E7%9A%84%E5%8C%BA%E5%88%AB

#### 模糊查询：

模糊查询有很多种方法，写法最简单的是：

```ts
/**
 * @param username 模糊匹配字段
 */
async fuzzFindByRepository(username: string) {
  // Like是从typeorm中引入的内容
  return await this.usersRepository.find({ username: Like(`%${username}%`) });
}
```

其它的模糊查询写法可以参考这个：
https://github.com/nest-cn-community/issues-box/issues/3

### 类型层

每个模块内部单独抽出一个type文件夹，里面放置该模块的类型。其中一个文件专门放置enum类型，另一些文件可以放置type、interface等。最后通过type/index.ts导出去：

比如：
user/type/user.enum.ts

```ts
export enum UserStatus {
  REMOVED = -1, // 已删除
  NOT_ACTIVE = 0, // 未激活
  ACTIVE = 1, // 已激活
};

export enum Gender {
  UNKNOWN = 0, // 保密
  MALE = 1, // 男
  FEMALE = 2, // 女
};
```

user/type/index.ts

```ts
export * from './user.enum';
export * from './user.interface';
// ...
```

### 错误处理
#### 内置的错误处理器：

NestJS 提供了开箱即用的常用异常类，在使用时，只需实例化相应的异常类：

BadRequestException
UnauthorizedException
NotFoundException
ForbiddenException
NotAcceptableException
RequestTimeoutException
ConflictException
GoneException
PayloadTooLargeException
UnsupportedMediaTypeException
UnprocessableEntityException
InternalServerErrorException
NotImplementedException
BadGatewayException
ServiceUnavailableException
GatewayTimeoutException

#### 扩展自己的错误处理类：

如果上述异常类都无法满足我们的业务需求，此时，我们只需要继承 HttpException 类，来完成异常类的扩展：

```ts
export class MyCustomException extends HttpException {
  constructor() {
    super('my custom message', 409);
  }
}
```

#### 定义异常过滤器：

虽然上述异常处理类可以满足大部分异常需求，但有时我们想完全控制异常处理程序，让它以我们希望的方式去运转。例如，增加一些日志，或是依据不同条件返回不同的 JSON 结构。此时，就需要用到NestJS的异常过滤器了。我们只需要实现 ExceptionFilter 接口即可。

当前，默认请跨的时候，在进行请求出现错误时，NestJS返回的错误信息格式如下：
```ts
{
  "statusCode": 401,
  "message": "username为paian的用户已经存在"
}
```

如果我们想统一请求返回的数据格式，将它统一变成如下格式，应该怎么处理呢？

```json
{
  "code": -1,
  "data": {},
  "message": "username为paian10的用户已经存在"
}
```

首先我们需要对错误进行统一拦截处理。下面我们来实现一个异常过滤器：HttpExceptionFilter。

```ts
import { Catch, ExceptionFilter, HttpException, ArgumentsHost } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const request = ctx.getRequest(); // 在请求上下文中获取request对象
    const response = ctx.getResponse(); // 在请求上下文中获取response对象
    const status = exception.getStatus(); // 获取异常的状态码

    const message = exception.message ?? `${status >= 500 ? 'Server Error' : 'Client Error'}`;

    // 设置返回的状态码、请求头，发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send({
      code: -1,
      data: {},
      message,
    });
  }
}
```

异常过滤器有如下几种级别：

- 控制器方法级别：在 Controller 的方法上使用 @UseFilters(HttpExceptionFilter)

在控制器的某个方法中使用上述定义的异常过滤器：@UseFilters(HttpExceptionFilter)，如下：

common/filter/http-exception.filter.ts

```ts
@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body() createUserDto: CreateUserDto) {
  // throw new ForbiddenException();
}

```

- 控制器类级别：在 Controller 类上使用 @UseFilters(HttpExceptionFilter)

- 全局级别：

全局级别的异常过滤器有两种使用方法：

方法1：

```ts
  import { NestFactory } from '@nestjs/core';
  import { ValidationPipe } from '@nestjs/common';
  import { AppModule } from './app.module';
+ import { HttpExceptionFilter } from './common/filter';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // 注册全局错误过滤器
+   app.useGlobalFilters(new HttpExceptionFilter());
    // 能进行请求参数验证、请求接口地址有效性验证
    app.useGlobalPipes(new ValidationPipe());
    // 添加路由前缀
    app.setGlobalPrefix('/api/v1');
    await app.listen(3000);
  }

  bootstrap();
```

方法2：

```ts
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class ApplicationModule {}
```

当定义的异常过滤器的构造函数中有依赖注入时，不能用方法1，而只能用方法2。

经过上面的处理，我们就可以把接口请求错误的返回数据格式改成如下了：

```json
{
  "code": -1,
  "data": {},
  "message": "username为paian的用户已经存在"
}
```

### 拦截器（interceptor）

可以通过 `nest g interceptor <文件要创建到src目标的什么路径>` 创建，比如：

```sh
nest g interceptor common/response
```

common/response.ts

```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return {
          data,
          code: 0,
          msg: '请求成功',
        };
      })
    );
  }
}
```

然后也是在main.ts中全局注册：

```ts
  import { NestFactory } from '@nestjs/core';
  import { ValidationPipe } from '@nestjs/common';
  import { AppModule } from './app.module';
  import { HttpExceptionFilter } from './common/filter';
+ import { ResponseInterceptor } from './common/response.interceptor';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // 注册全局错误过滤器
    app.useGlobalFilters(new HttpExceptionFilter());
    // 能进行请求参数验证、请求接口地址有效性验证
    app.useGlobalPipes(new ValidationPipe());
    // 添加路由前缀
    app.setGlobalPrefix('/api/v1');
    // 全局注册拦截器
+   app.useGlobalInterceptors(new ResponseInterceptor());
    await app.listen(3000);
  }

  bootstrap();
```

经过这样的处理，就不管是正常请求，还是请求错误的时候，都会返回如下的统一格式：

```js
{
  code: xxx,
  data: xxx,
  message: xxx,
}
```

### 中间件

中间件是请求发出者和路由处理器之间的桥梁。在 Nest 中中间件可以用多个，他们之间使用 next() 方法作为连接，连接后的所有中间件将在整个请求-响应周期内通过 next() 依次执行。

**Nest 中间件实际上等价于 express 中间件。**

下面是Express官方文档中所述的中间件功能：

中间件函数可以执行以下任务:

执行任何代码。
对请求和响应对象进行更改。
结束请求-响应周期。
调用堆栈中的下一个中间件函数。
如果当前的中间件函数没有结束请求-响应周期, 它必须调用 next() 将控制传递给下一个中间件函数。否则, 请求将被挂起。

#### 定义中间件

在NestJS中，中间件可以是一个函数，也可以是一个带有 @Injectable() 装饰器的类，且该类应该实现 NestMiddleware 接口，而函数没有任何特殊要求。如下是一个日志中间件的简单示例：

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
```

Nest中间件完全支持依赖注入。 就像提供者和控制器一样，它们能够注入属于同一模块的依赖项（通过 constructor ）。例如：

```ts
constructor(@Inject(SomeService) private readonly someService: SomeService) {

}
```

#### 使用中间件

既然中间件是请求发出者和路由处理器之间的桥梁，那么他就应该在一个模块的入口，即 XXXModule 类中被使用。中间件不能在 @Module() 装饰器中列出。我们必须使用模块类的 configure() 方法来设置它们。包含中间件的模块必须实现 NestModule 接口。我们将 LoggerMiddleware 设置在 ApplicationModule 层上。

```ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

在上面的例子中，我们为 /cats 路由处理器（@CatsController('/cats')）设置了日志中间件。
如果只需要给 /cats 路由中的某几个请求方法设置这个中间件，那只需要改变一下 forRoutes() 方法中的参数即可：forRoutes({ path: 'cats', method: RequestMethod.GET })，此时，只有 GET 请求才会被中间件拦截。

当应用程序越来越复杂时，路由也会随之增加，这个时候使用中间件，可能会存在很多 forRoutes() 的情况。基于此，Nest 提供了路由通配符的功能（与 Controller 中的路由通配符一样）。示例：

```ts
forRoutes({ path: 'ab*cd', method: RequestMethod.ALL })
```

除此之外，forRoutes() 方法中还可以传入一个控制器类，如：forRoutes(CatsController)，他会将 CatsController 中的所有路由拦截并使用中间件。如果需要传入多个控制器类，只需要使用 , 分割，如： forRoutes(CatsController, UserController)。

不仅如此，apply() 方法同样可以传入一个或多个(用 , 分割)中间件，如：apply(LoggerMiddleware, OtherMiddleware)。这里可以同时传入类或函数中间件。

当你想排除一个控制器类中的某些路由不使用中间件时，使用 exclude() 方法即可，如：

```ts
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        { path: 'cats', method: RequestMethod.GET },
        { path: 'cats', method: RequestMethod.POST },
      )
      .forRoutes(CatsController);
  }
}
```

### 函数中间件

Nest 中的中间件可以是类，也可以是一个函数，上述都在讲关于类的中间件，这里使用函数来声明一个中间件：

```ts
export function logger(req, res, next) {
  console.log(`Request...`);
  next();
};
```

然后，在模块中使用即可：

```ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { logger } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(logger)
      .forRoutes(CatsController);
  }
}
```

#### 全局中间件

如果我们想一次性将中间件绑定到每个注册路由，我们可以使用由INestApplication实例提供的 use()方法：

```ts
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);
```

### 使用@nestjs/swagger和swagger-ui-express快速搭建API文档

#### 安装依赖：

```sh
pnpm add @nestjs/swagger swagger-ui-express -S
```

#### 配置文档

```ts
  import { NestFactory } from '@nestjs/core';
  import { ValidationPipe } from '@nestjs/common';
+ import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
  import { AppModule } from './app.module';
  import { HttpExceptionFilter } from './common/filter';
  import { ResponseInterceptor } from './common/response.interceptor';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // 注册全局错误过滤器
    app.useGlobalFilters(new HttpExceptionFilter());
    // 能进行请求参数验证、请求接口地址有效性验证
    app.useGlobalPipes(new ValidationPipe());
    // 添加路由前缀
    app.setGlobalPrefix('/api/v1');
    // 全局注册拦截器
    app.useGlobalInterceptors(new ResponseInterceptor());

+   // 设置swagger文档
+   const options = new DocumentBuilder()
+     .setTitle('Miaoda API文档') // 接口文档标题
+     .setDescription('这是miaoda项目的API文档，如有问题欢迎issue反馈') // 文档介绍
+     .setVersion('0.1.0') // 接口版本号
+     // .addTag('标签1, 标签2') // 这里可以添加多个标签，实际上是swagger的分类
+     .addBearerAuth() // 增加全局进行 Authorization 验证
+     .build();
+   const document = SwaggerModule.createDocument(app, options);
+   // 用SwaggerModule类初始化swagger
+   // SwaggerModule.setup()第一个参数是接口访问路径
+   // 启动或就可以通过访问http://localhost:3000/api来查看到接口文档了
+   SwaggerModule.setup('/api', app, document);

    await app.listen(3000);
  }

  bootstrap();
```

这样，启动服务或就可以通过访问 http://localhost:3000/api 来查看到接口文档了。

SwaggerModule寻找所有的使用@Body()，@Query()以及@Param()在路由处理器装饰。因此，可以创建有效的文档。该模块利用反射创建相应的模型定义。

但仅仅依靠这些是不够的。比如，目前CreateUserDto、UpdateUserDto、User的文档内容都是空的。

怎么把其中的字段生成到Swagger文档中呢？

可以用这样两个装饰器：

- @ApiProperty()
  装饰必填的Dto字段

- @ApiPropertyOptional() 等同于 @ApiProperty({ required: false} )
  装饰选填的Dto字段

还可以添加描述信息：

```ts
  @ApiProperty({
+   description: '用户状态'
  })
  @IsEnum(UserStatus)
  @Type(() => Number)
  @IsNotEmpty({ message: '用户状态不能为空' })
  status: UserStatus;
```

另外，可以用@ApiTags('xxx')来给控制器或者控制器的方法打标签，以将文档进行分类。
```ts
@ApiTags('用户模块的接口')
@Controller('user')
export class UserController {
  // ...
}
```

在Controller中，在每一个路由的前面使用@ApiOperation({ summary: 'xxx' })装饰器来做接口说明。

还有许多其它装饰器，参见这里：
https://docs.nestjs.cn/8/openapi?id=%e8%a3%85%e9%a5%b0%e5%99%a8

下面是详细的配置项介绍：

（摘自：https://juejin.cn/post/6893391726803845133）

```ts
export declare class DocumentBuilder {
  private readonly logger;
  private readonly document;
  setTitle(title: string): this;  // 设置swagger ui标题
  setDescription(description: string): this; // 设置swagger ui描述
  setVersion(version: string): this; // 设置swagger ui版本
  setTermsOfService(termsOfService: string): this; // 设置条例链接,可以单纯理解为一个外链
  setContact(name: string, url: string, email: string): this; // 联系信息
  setLicense(name: string, url: string): this; // 采用的协议,比如MIT等等
  // 若是用到了外部nginx这类接口,这个可以拼接请求域
  addServer(url: string, description?: string, variables?: Record<string, ServerVariableObject>): this;
  setExternalDoc(description: string, url: string): this; // 设置外部文档链接
  setBasePath(path: string): this; // 可以理解为聚合前缀,在nest有自己的api可以用,可以忽略设置这个
  addTag(name: string, description?: string, externalDocs?: ExternalDocumentationObject): this; // 添加swagger分类
  addSecurity(name: string, options: SecuritySchemeObject): this; // 以下都是鉴权安全性相关的
  addSecurityRequirements(name: string, requirements?: string[]): this; // ...
  addBearerAuth(options?: SecuritySchemeObject, name?: string): this;// Bearer 认证
  addOAuth2(options?: SecuritySchemeObject, name?: string): this;// OAuth2 认证
  addApiKey(options?: SecuritySchemeObject, name?: string): this;//
  addBasicAuth(options?: SecuritySchemeObject, name?: string): this;// 基础认证
  addCookieAuth(cookieName?: string, options?: SecuritySchemeObject, securityName?: string): this; // Cookie 认证
  build(): Omit<OpenAPIObject, 'components' | 'paths'>; // 读取设置好的配置构建出swagger的集中化配置
}

export interface SwaggerDocumentOptions {
  include?: Function[]; // 手动指定包含的模块
  extraModels?: Function[]; // 额外的model定义需和上面的关联,也就是存在include里面的
  ignoreGlobalPrefix?: boolean; // 这个设置为true,会忽略setGlobalPrefix的设置
  deepScanRoutes?: boolean; // 开启这个,只要是import的都会追加的索引的路由
  // 操作id,可以通过这个工厂函数来改变id的定义(接口请求生成)
  // 默认走的是@default () => controllerKey_methodKey, 模块_方法
  operationIdFactory?: (controllerKey: string, methodKey: string) => string;
}

export interface SwaggerCustomOptions {
  explorer?: boolean; // 开了没啥效果
  swaggerOptions?: any; // swagger ui的配置
  customCss?: string; // 自定义css
  customCssUrl?: string; // 自定义css 链接
  customJs?: string; // 同上,js
  customFavIcon?: string;// 同上,小图标
  swaggerUrl?: string; // swagger链接设置
  customSiteTitle?: string; // 自定义网站标题
  validatorUrl?: string; // 远程校验url,一般用不到
  url?: string;// 指向API定义的URL(通常是swagger。json或swagger.yaml)。如果使用url或规范，将被忽略。
  urls?: Record<'url' | 'name', string>[];// 没用过
}
```

## 用户密码加密

码不能以明文形式保存到数据库中，否则数据泄露密码就会被知道。所以注册功能我们需要用到加密。

MD5加密的缺点：

MD5加密理论上是不能破解的，因为MD5采用的是不可逆算法。

然后，有的网站上提供MD5解密，是因为有大量的存储空间来保存源码和加密后的密码，当解密时就是一个查询的过程，稍微复杂点的查询就无法完成。这种解密方式，叫做 字典攻击（也叫撞库），因为对于相同的输入，MD5加密得到的密码是固定的。

bcryptjs加密：

解决字典攻击的方式 是加盐。bcryptjs 是一个比较好的Node.js加盐（salt）加密的包。所谓加盐，就是系统生成一串随机值，然后混入原始密码中。当加的盐不一样的时候，对于相同的原始密码，得到的加密后的密码也不一样。从而可以解决字典攻击的问题。

先安装依赖：

```sh
pnpm add bcryptjs -S
```

```js
// 生成盐，参数是轮数
const salt = bcrypt.genSaltSync(10);
```

再来看看这个库的加密和校验方法的使用：

```js
// 加密。
// 第一个参数是待加密的数据
// 第二个参数是用于哈希密码的盐。如果指定为数字，则将使用指定的轮数生成盐并将其使用。推荐 10
const encryptedPassword = await bcryptjs.hash(data, salt);
```

```js
// 校验
// 第一个参数是要比较的数据, 是用户登录时输入的密码
// 第二个参数是要比较的数据，是从数据库中查询出来的加密过的密码
const isMatched = bcryptjs.compareSync(password, encryptedPassword);
```

如果相同，则会返回结果为true。表示密码验证通过。

为了便于多模块使用，比如，创建用户的时候和更新用户信息的时候，涉及到密码的部分都得加密。我们将加密模块单独抽成一个util工具库：

common/utils/encrypt.ts

```ts
// https://www.npmjs.com/package/bcryptjs
import * as bcrypt from 'bcryptjs';

// 生成salt（盐）
export function genSalt() {
  return bcrypt.genSaltSync(10);
}

export async function encrypt(data: string, salt = genSalt()) {
  const result = await bcrypt.hash(data, salt);
  console.log('加密完成');
  return result;
}
```

然后，在user/entity/user.entity.ts中引入它进行使用：

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateEntity } from '../../common/entity';
+ import { encrypt } from '../../common/utils';

import {
  UserStatus,
  Gender,
} from '../type';

@Entity()
export class User extends DateEntity {
  @ApiProperty({ description: '用户编号' })
  @PrimaryGeneratedColumn({
    comment: '用户编号',
    type: 'int',
    unsigned: true
  })
  id: number;

  @ApiPropertyOptional({ description: '工号' })
  @Column({
    name: 'work_id',
    comment: '工号',
    type: 'char',
    length: 7,
    nullable: true,
    unique: true,
  })
  workId: string;

  @ApiProperty({ description: '用户名' })
  @Column({
    comment: '用户名',
    type: 'varchar',
    length: 14,
    nullable: false,
    unique: true,
  })
  username: string;

  // select 控制隐藏列
  // 如果要查询的模型具有"select：false"的列，则需要使用addSelect函数来从列中检索信息。
  // .addSelect("user.password")
  // 采用select的方式虽然查询时能隐藏，但.save()返回的结果没有隐藏
  // 若采用此种方式，为免密码暴露，返回的时候需要重新过滤一下，比较容易忘记
  // 所以推荐使用Exclude
  @ApiProperty({ description: '密码' })
+ @Exclude()
  @Column({
    comment: '密码',
-   // select: false,
+   type: 'char',
+   length: 60,
    nullable: false,
  })
  password: string;

  @ApiPropertyOptional({ description: '手机号码' })
  @Column({
    comment: '手机号码',
    type: 'char',
    length: 11,
    nullable: true,
  })
  phone: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @Column({
    comment: '邮箱',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  email: string;

  @ApiPropertyOptional({ description: '性别' })
  @Column({
    comment: '性别',
    type: 'tinyint',
    nullable: true,
    default: 0,
  })
  gender: Gender;

  @ApiPropertyOptional({ description: '头像' })
  @Column({
    comment: '头像',
    type: 'char',
    length: 200,
    nullable: true,
  })
  avatar: string;

  @ApiProperty({ description: '用户状态' })
  @Column({
    comment: '用户状态',
    type: 'tinyint',
    nullable: false,
    default: 1,
  })
  status: UserStatus;

+ @BeforeInsert()
+ async encryptPassword() {
+   this.password = await encrypt(this.password);
+ }
}
```

然后在其中，我们做了如下修改：

第一是使用@BeforeInsert()装饰器，因为数据在.save()到数据库的时候会触发BeforeInsert装饰的函数，从后确保新建用户的时候，能对密码进行加密。

第二是，因为加密后密码的长度是固定的，所以数据类型就不能再用varchar了，因此我们把类型改成char，并且给出固定的长度。

第三是使用了@Exclude()装饰器，来隐藏password字段，使得查询的时候不返回。采用给@Column()装饰器传入{select: false}选项是一种方式，但是这是不彻底的。因为当你调用.save()方法返回的结果中，仍然会发现密码字段没有隐藏（调用.find()的时候是隐藏的），这个时候，你必须手动对它进行处理然后才能再返回，但是这很容易遗忘而导致密码泄露。不过，使用@Exclude()装饰器得配合对Controller应用@UseInterceptors(ClassSerializerInterceptor)装饰器：

```ts
  @ApiTags('用户模块')
+ @UseInterceptors(ClassSerializerInterceptor)
  @Controller('user')
  export class UserController {
```

UseInterceptors 和 ClassSerializerInterceptor 都是从 @nestjs/common 模块中引入的。

此外，我们不仅需要处理新建时的用户密码的加密，还得处理更新用户时的密码加密。具体自己看下代码。

## 日志

winston：
https://github.com/winstonjs/winston

pino:
https://github.com/pinojs/pino
可参考：https://juejin.cn/post/6893059048019918855

log4js-node：
https://github.com/log4js-node/log4js-node

## commit message的校验配置
https://juejin.cn/post/6891894638618755085



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

## 关于NestJS的一些参考资料：

NestJS中文文档
https://docs.nestjs.cn/8

TypeORM中文文档：
https://typeorm.biunav.com/zh/

https://orkhan.gitbook.io/typeorm/docs/zh_cn-8/decorator-reference

TypeORM培训教程（质量不错）
https://www.tutorialspoint.com/typeorm/typeorm_entity.htm

使用NestJS搭建服务端应用
https://juejin.cn/post/7053840108331466783#heading-30
其中关于NestJS的各个分层的视角比较简明易懂。VO层和接口层值得参考

全网最全Nodejs学习资料汇总，没有之一
https://blog.csdn.net/weixin_46696639/article/details/122391378

nestjs搭建通用业务框架（4）：工程目录与代码规范
https://www.toimc.com/nestjs-example-project-4/

全栈接入GraphQL视频教程：
https://www.howtographql.com/basics/0-introduction/

Nest框架中国开发者社区：
https://github.com/nest-cn-community



Nest.js系列文章之入门篇
http://www.inode.club/node/nestjs_start.html

带前端学Node系列Nest.js实现用户注册登录
http://www.inode.club/node/nestjs2.html

做了一个Nest.js上手项目，很丑，但适合练手和收藏
https://zhuanlan.zhihu.com/p/402207092


一些不错的demo：
angular+nestjs 后台管理系统，实现最基本的RBAC权限
https://github.com/NG-NEST/ng-nest-moon

使用 Nest 构建的一个简单的用户发帖系统。
https://github.com/dzzzzzy/Nestjs-Learning/tree/master/demo/easy-post

graphql API demo
https://github.com/dzzzzzy/Nestjs-Learning/tree/master/demo/graphql-api

使用 Redis 实现登录挤出功能
https://blog.csdn.net/huan1043269994/article/details/107572396
