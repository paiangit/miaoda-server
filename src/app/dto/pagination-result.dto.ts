import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { App } from '../entity/app.entity';

export class PaginationResultDto {
  @ApiProperty()
  @IsNotEmpty()
  data: App[];

  @ApiProperty()
  @IsNotEmpty()
  offset: number;

  @ApiProperty()
  @IsNotEmpty()
  pageSize: number;

  @ApiProperty()
  @IsNotEmpty()
  totalCount: number;
}
