import { HttpException, Injectable } from '@nestjs/common';
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

  // 创建用户
  public async create(createUserDto: CreateUserDto) {
    const { username } = createUserDto;
    const user = await this.usersRepository.findOne({ username });

    if (user) {
      throw new HttpException(`username为${username}的用户已经存在`, 401);
    }

    // 注意：这里有个大坑——你必须先把它实例化成一个User的实例，然后再去保存，
    // 否则，是无法在创建用户的时候触发user.entity中的@BeforeInsert()装饰器的
    // 也就无法完成密码的加密
    const entity = Object.assign(new User(), createUserDto);
    return this.usersRepository.save(entity);
  }

  // 删除用户
  public async remove(id: string) {
    const user = await this.findOneById(id);

    if (!user) {
      throw new HttpException(`id为${id}的用户不存在`, 400);
    }

    user.status = UserStatus.REMOVED;

    try {
      await this.update(id, user);
      return {};
    } catch(err) {
      throw new HttpException('删除失败', 400);
    }
  }

  // 更新用户
  public async update(id: string, updateUserDto: UpdateUserDto) {
    const formattedId = parseInt(id, 10);
    const { username } = updateUserDto;
    const existSameNameUser = await this.usersRepository.findOne({ username });
    // 校验是否已存在别的记录username与当前username冲突的情况
    if (existSameNameUser && formattedId !== existSameNameUser.id) {
      throw new HttpException(`操作失败，其它记录中username为${username}的用户已经存在`, 401);
    }

    const originUser = await this.usersRepository.createQueryBuilder('user')
      .where('user.id = :id', { id: formattedId })
      // .addSelect('user.password') // 将隐藏的password列的信息也包含在查询结果中
      .getOne();

    if (!originUser) {
      throw new HttpException(`操作失败，id为${id}的用户不存在`, 401);
    }

    const mergedUser = this.usersRepository.merge(originUser, updateUserDto);
    return this.usersRepository.update(id, mergedUser);
  }

  // 按id查询用户
  public findOneById(id: string) {
    return this.usersRepository.findOne({ id: +id });
  }

  // 按用户名查询
  // 第二个参数是返回的数据中是否需要包含密码，默认不包含，如果开启该选项，需要慎重评估
  // 除非是登录功能，其它情况一般返回的数据中都不应该包含密码
  public async findOneByUsername(username: string, containPassword: boolean = false) {
    if (!containPassword) {
      return await this.usersRepository.findOne({ username });
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // 通过addSelect添加password查询，否则查询结果中默认没有密码
      .where('user.username=:username', { username })
      .getOne();

    return user;
  }

  // 查找所有用户
  public async list(paginationRequestDto: PaginationRequestDto): Promise<PaginationResultDto> {
    const totalCount = await this.usersRepository.count();
    const { pageSize, offset } = paginationRequestDto;

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
