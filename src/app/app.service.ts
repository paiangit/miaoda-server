import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Like } from 'typeorm';
import { App } from './entity';
import { CreateAppDto, PaginationRequestDto, PaginationResultDto, UpdateAppDto } from './dto';
import { AppStatus } from './type';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(App)
    private appsRepository: Repository<App>
  ){}

  public async create(createAppDto: CreateAppDto) {
    const entity = Object.assign(new App(), createAppDto);

    return this.appsRepository.save(entity);
  }

  public async remove(id: string) {
    const app = await this.findOneById(id);

    if (!app) {
      throw new HttpException(`id为${id}的应用不存在`, 400);
    }

    app.status = AppStatus.REMOVED;

    try {
      await this.update(id, app);
      return {};
    } catch(err) {
      throw new HttpException('删除失败', 400);
    }
  }

  // 按id查询应用
  public findOneById(id: string) {
    return this.appsRepository.findOne({ id: +id });
  }

  // 获取应用列表
  public async list(paginationRequestDto: PaginationRequestDto): Promise<PaginationResultDto> {
    const { pageSize, offset, title } = paginationRequestDto;
    let apps;
    if (title) {
      apps = await this.appsRepository.createQueryBuilder('app')
        .where({ title: Like(`%${title}%`), status: Not(AppStatus.REMOVED) });
    } else {
      apps = await this.appsRepository.createQueryBuilder('app')
        .where({ status: Not(AppStatus.REMOVED) });
        // 等价于
        // .where('app.status != :status', { status: AppStatus.REMOVED });
    }

    const totalCount = await apps.getCount();
    const data = await apps
    .orderBy('created_at', 'DESC')
    .skip(offset) // 跳过多少前面页的数据
    .take(pageSize) // 最多获取pageSize条数据
    .getMany();

    return {
      data,
      totalCount,
      offset: offset + data.length,
      pageSize,
    };
  }

  // 更新应用的信息
  public async update(id: string, updateAppDto: UpdateAppDto) {
    const formattedId = parseInt(id, 10);
    const originalApp = await this.appsRepository.findOne({ id: formattedId });
    const mergedApp = this.appsRepository.merge(originalApp, updateAppDto);

    return this.appsRepository.update(id, mergedApp);
  }
}
