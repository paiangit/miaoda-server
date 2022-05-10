import { Module, DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './local.strategy';

// 根据环境变换环境变量来切换配置文件
const env = String(process?.env?.NODE_ENV ?? 'development');
const envFilePath = resolve(__dirname, `../../.env.${env}`);

const jwtModule: DynamicModule = JwtModule.registerAsync({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
    }),
  ],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    // 从环境变量配置文件读取配置信息
    const secret = configService.get('JWT_SECRET');
    const expiresIn = configService.get('JWT_EXPIRES_IN');

    return {
      secret, // 密钥
      signOptions: {
        expiresIn, // 过期时间
      },
    };
  },
});

@Module({
  imports: [UserModule, ConfigModule, jwtModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, ConfigService, JwtStrategy],
  exports: [],
})
export class AuthModule {}
