import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import OrmConfig from './config/ormconfig.dev';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(OrmConfig as any),
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
