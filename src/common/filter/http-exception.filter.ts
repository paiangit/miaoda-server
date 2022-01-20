import { Catch, ExceptionFilter, HttpException, ArgumentsHost } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    // const request = ctx.getRequest(); // 在请求上下文中获取request对象
    const response = ctx.getResponse(); // 在请求上下文中获取response对象
    const status = exception.getStatus(); // 获取异常的状态码

    let message = `${status >= 500 ? 'Server Error' : 'Client Error'}`;

    const res = exception.getResponse();
    if (typeof res === 'object' && (res as any).message) {
      if ((typeof (res as any).message) === 'string') {
        message = (res as any).message;
      } else {
        message = (res as any).message[0];
      }
    } else {
      message = exception.message;
    }

    // 设置返回的状态码、请求头，发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send({
      code: -1,
      message,
      data: {},
    });
  }
}
