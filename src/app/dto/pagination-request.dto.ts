import { IsNotEmpty, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationRequestDto {
  // 因为地址栏中的参数取出来之后是字符串类型的，
  // 所以需要先用class-transformer的Type先转成数字，再去用IsInt校验
  // 否则就直接校验不通过了
  @ApiProperty({ description: '每页数据条数' })
  @Min(1)
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty({ message: '每页数据条数不能为空' })
  pageSize: number; // 每页数据条数

  @ApiProperty({ description: '跳过多少条数据' })
  @Min(0)
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty({ message: '跳过的数据条数不能为空' })
  offset: number;

  @ApiPropertyOptional({ description: '应用的标题' })
  title?: string;
}
