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
