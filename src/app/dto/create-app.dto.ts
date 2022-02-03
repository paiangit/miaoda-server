import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { AppThemeColor } from "../type";

export class CreateAppDto {
  @ApiProperty({ description: '应用标题' })
  @MinLength(1)
  @IsNotEmpty({ message: '应用标题不能为空' })
  @IsString()
  title: string;

  @ApiProperty({ description: '应用简介' })
  @MaxLength(100)
  @IsString()
  description: string;

  @ApiProperty({ description: '图标' })
  @IsString()
  icon: string;

  @ApiProperty({ description: '主题颜色' })
  @IsNotEmpty({ message: '主题颜色不能为空' })
  @IsString()
  themeColor: AppThemeColor;
}
