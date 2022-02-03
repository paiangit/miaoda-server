import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import OrmConfig from './config/ormconfig.dev';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppModule } from './app/app.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(OrmConfig as any),
    AuthModule,
    UserModule,
    AppModule,
  ],
  controllers: [],
  providers: [],
})
export class ApplicationModule {}
