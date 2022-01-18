import { Catch, ExceptionFilter, HttpException, ArgumentsHost } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const request = ctx.getRequest(); // 在请求上下文中获取request对象
    const response = ctx.getResponse(); // 在请求上下文中获取response对象
    const status = exception.getStatus(); // 获取异常的状态码

    const message = exception.message ?? `${status >= 500 ? 'Server Error' : 'Client Error'}`;

    // 设置返回的状态码、请求头，发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send({
      code: -1,
      data: {},
      message,
    });
  }
}
