import { IsNotEmpty, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../type';

export class UpdateUserDto {
  @ApiProperty({ description: '用户编号' })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty({ message: 'id不能为空' })
  id: number;

  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '用户状态' })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty({ message: '用户状态不能为空' })
  status: UserStatus;

  @ApiPropertyOptional({ description: '用户密码' })
  password: string;
}
