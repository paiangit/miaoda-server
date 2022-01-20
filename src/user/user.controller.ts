import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  PaginationRequestDto,
  PaginationResultDto,
} from './dto';
import { encrypt } from '../common/utils';

@ApiTags('用户模块')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ){}

  @ApiOperation({ summary: '创建用户' })
  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @ApiOperation({ summary: '分页查询用户列表' })
  @Get('list')
  list(
    @Query() paginationRequestDto: PaginationRequestDto,
  ): Promise<PaginationResultDto> {
    const PAGE_SIZE_LIMIT = 50;
    let pageSize;
    let offset;

    try {
      pageSize = parseInt(`${paginationRequestDto.pageSize}`, 10);
      offset = parseInt(`${paginationRequestDto.offset}`, 10);
    } catch(err) {
      throw new HttpException('请求参数格式错误', 401);
    }

    if (Number.isNaN(pageSize) || Number.isNaN(offset)) {
      throw new HttpException('请求参数格式错误', 401);
    }

    return this.userService.list({
      offset,
      pageSize: Math.min(PAGE_SIZE_LIMIT, pageSize),
    });
  }

  @ApiOperation({ summary: '按id查询用户信息' })
  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    if (user) {
      return user;
    } else {
      throw new HttpException('没有符合条件的用户', 401);
    }
  }

  @ApiOperation({ summary: '更新用户的信息' })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if ((updateUserDto as any).password) {
      updateUserDto.password = encrypt(updateUserDto.password)
    }
    return this.userService.update(id, updateUserDto);
  }
}
