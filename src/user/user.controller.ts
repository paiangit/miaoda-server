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
