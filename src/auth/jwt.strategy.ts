import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      // 从请求中提取 JWT 的方法
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 告诉passport模块，如果收到的是过期的 JWT ，将请求拒绝，发送 401 响应
      ignoreExpiration: false,
      // JWT加密和验证的密钥
      secretOrKey: configService.get<string>('JWT_SECRET'),
    } as StrategyOptions);
  }

  /**
   * 你可能会有疑问，为什么这里的validate方法如此简单，根本没有校验的逻辑？
   * 其实，这是因为基于 JWT 的策略，passport 模块会首先验证 JWT 的签名并解码成 JSON 。然后才会调用我们的 validate() 方法，并将解码后的 JSON 作为其单个参数传递进来。所以，那些JWT是否过期、是否合法以及相关的解成JSON的工作，都由passport模块完成了。
   * 这里仍然提供validate方法，还有一个用处。因为JWT中存的只是很简单的用户信息，如果你需要返回更多的信息，可以基于JWT解出来的已有信息，在这个validate方法中进一步查询数据库，从而获得更丰富的信息，并将它们挂载到请求对象上。
   * 此外，如果我们想实现令牌失效的功能。也可以在这一步来实现，首先，你需要持久化一个失效令牌的清单，然后，在这一步你可以根据用户的 id 或 username等信息，去失效令牌列表中查询，如果命中，这拒绝请求。
   */
  async validate(payload) {
    return {
      id: payload.sub,
      username: payload.username,
    };
  }
}
