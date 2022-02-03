import { ApiProperty } from '@nestjs/swagger';
import { MinLength, MaxLength, IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { AppThemeColor } from '../type';

export class UpdateAppDto {
  @ApiProperty({ description: '应用标题' })
  @MinLength(1)
  @IsNotEmpty({ message: '应用标题不能为空' })
  @IsString()
  title: string;

  @ApiProperty({ description: '应用简介' })
  @MaxLength(100)
  @IsString()
  description: string;

  @ApiProperty({ description: '应用图标' })
  @IsString()
  icon: string;

  @ApiProperty({ description: '主题颜色' })
  @IsNotEmpty({ message: '主题颜色不能为空' })
  @IsNumber()
  themeColor: AppThemeColor;
}
