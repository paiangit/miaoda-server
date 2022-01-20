import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ description: '用户名' })
  @MinLength(5, { message: '用户名不能小于5位' })
  @MaxLength(14, { message: '用户名不能超过14位' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @MinLength(8, { message: '密码不能小于8位' })
  @MaxLength(14, { message: '密码不能大于14位' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
