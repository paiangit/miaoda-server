import { Body, Controller, Delete, HttpException, Param, Get, Post, Query, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateAppDto, UpdateAppDto, PaginationRequestDto, PaginationResultDto } from './dto';

@ApiTags('应用模块')
@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService
  ){}

  @ApiOperation({ summary: '创建应用' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  create(@Body() createAppDto: CreateAppDto) {
    return this.appService.create(createAppDto);
  }

  @ApiOperation({ summary: '删除应用' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appService.remove(id);
  }

  @ApiOperation({ summary: '分页查询应用列表' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  list(
    @Query() paginationRequestDto: PaginationRequestDto,
  ): Promise<PaginationResultDto> {
    const PAGE_SIZE_LIMIT = 50;
    let pageSize;
    let offset;
    let title = '';

    try {
      pageSize = parseInt(`${paginationRequestDto.pageSize}`, 10);
      offset = parseInt(`${paginationRequestDto.offset}`, 10);
      title = paginationRequestDto.title;
    } catch(err) {
      throw new HttpException('请求参数格式错误', 400);
    }

    if (Number.isNaN(pageSize) || Number.isNaN(offset)) {
      throw new HttpException('请求参数格式错误', 400);
    }

    const params = {
      offset,
      pageSize: Math.min(PAGE_SIZE_LIMIT, pageSize),
    };
    title && ((params as PaginationRequestDto).title = title);

    return this.appService.list(params);
  }

  @ApiOperation({ summary: '按id查询应用' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const app = this.appService.findOneById(id);

    if (app) {
      return app;
    } else {
      throw new HttpException('没有符合条件的应用', 400);
    }
  }

  @ApiOperation({ summary: '更新应用信息' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Param('id') id: string, @Body() updateAppDto: UpdateAppDto) {
    return this.appService.update(id, updateAppDto);
  }
}
