import { HttpException, Injectable, Query } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUserDto,
  UpdateUserDto,
  PaginationRequestDto,
  PaginationResultDto,
} from './dto';
import { UserEntity } from './entity/user.entity';
import { UserStatus } from './type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>
  ) {}

  // 创建用户
  public async create(createUserDto: CreateUserDto) {
    const { username } = createUserDto;
    const user = await this.usersRepository.findOne({ username });

    if (user) {
      throw new HttpException(`username为${username}的用户已经存在`, 401);
    }

    return this.usersRepository.save(createUserDto);
  }

  // 删除用户
  public async remove(id: string) {
    const user = await this.findOne(id);

    if (!user) {
      throw new HttpException(`id为${id}的用户不存在`, 401);
    }

    user.status = UserStatus.REMOVED;

    return this.update(id, user);
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
  public findOne(id: string) {
    return this.usersRepository.findOne({ id: +id });
  }

  // 查找所有用户
  public async list(@Query() PaginationRequestDto: PaginationRequestDto): Promise<PaginationResultDto> {
    const totalCount = await this.usersRepository.count();
    const users = await this.usersRepository.createQueryBuilder('user') // 参数'user'是别名
      .where('user.status != :status', { status: -1 }) // 选择状态不等于-1（被删除）的元素，这里的user用的就是上一行中定义的别名
      .orderBy('created_at', 'DESC') // 降序排列
      .skip(PaginationRequestDto.offset) // 跳过多少前面页的数据
      .take(PaginationRequestDto.pageSize) // 最多获取pageSize条数据
      .getMany();

    return {
      data: users,
      totalCount,
      offset: PaginationRequestDto.offset,
      pageSize: PaginationRequestDto.pageSize,
    };
  }
}
