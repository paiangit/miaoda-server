import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filter';
import { ResponseInterceptor } from './common/interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 注册全局错误过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  // 能进行请求参数验证、请求接口地址有效性验证
  app.useGlobalPipes(new ValidationPipe());
  // 添加路由前缀
  app.setGlobalPrefix('/api/v1');
  // 全局注册拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());
  // 允许跨域
  app.enableCors({
    origin: 'http://localhost',
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
    ],
  });

  // 设置swagger文档
  const options = new DocumentBuilder()
    .setTitle('Miaoda API文档') // 接口文档标题
    .setDescription('这是miaoda项目的API文档，如有问题欢迎issue反馈') // 文档介绍
    .setVersion('0.1.0') // 接口版本号
    .addTag('标签1, 标签2') // 这里可以添加多个标签，实际上是swagger的分类
    .addBearerAuth() // 增加全局进行 Authorization 验证的配置入口（会出现文字为Authorize，带小锁头的按钮）
    .build();
  const document = SwaggerModule.createDocument(app, options);

  // 用SwaggerModule类初始化swagger
  // SwaggerModule.setup()第一个参数是接口访问路径
  // 启动或就可以通过访问http://localhost:3000/docs来查看到接口文档了
  SwaggerModule.setup('/docs', app, document);
  await app.listen(3000);
}

bootstrap();
