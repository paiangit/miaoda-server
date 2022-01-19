import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entity/user.entity';

export class PaginationResultDto {
  @ApiProperty()
  @IsNotEmpty()
  data: User[];

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
