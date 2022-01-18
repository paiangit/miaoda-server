import {
  IsNotEmpty,
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../type';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @MinLength(5)
  @MaxLength(14)
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '密码' })
  @MinLength(8)
  @MaxLength(14)
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({ description: '用户状态' })
  @IsEnum(UserStatus)
  @Type(() => Number)
  @IsNotEmpty({ message: '用户状态不能为空' })
  status: UserStatus;

  @ApiPropertyOptional({ description: '手机号码' })
  phone: string;
}
