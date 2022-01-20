import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  UseGuards,
  UseInterceptors,
  Post,
  Body,
  Req,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { SignInDto } from './dto';

@ApiTags('鉴权模块')
// 重要：为了将隐藏字段过滤掉，避免返回给客户端，造成密码泄露！！！
// 虽然实际上我们已经在auth/auth.service.ts中显式地对密码字段做了删除，
// 但为防止以后还有其它的隐藏字段被泄露，这里做个二次兜底
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: '用户登录' })
  @UseGuards(AuthGuard('local'))
  @Post('signIn')
  async login(@Body() signInDto: SignInDto, @Req() req) {
    return req.user;
  }
}
