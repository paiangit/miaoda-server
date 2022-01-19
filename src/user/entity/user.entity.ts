import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateEntity } from '../../common/entity';
import { encrypt } from '../../common/utils';

import {
  UserStatus,
  Gender,
} from '../type';

@Entity()
export class User extends DateEntity {
  @ApiProperty({ description: '用户编号' })
  @PrimaryGeneratedColumn({
    comment: '用户编号',
    type: 'int',
    unsigned: true
  })
  id: number;

  @ApiPropertyOptional({ description: '工号' })
  @Column({
    name: 'work_id',
    comment: '工号',
    type: 'char',
    length: 7,
    nullable: true,
    unique: true,
  })
  workId: string;

  @ApiProperty({ description: '用户名' })
  @Column({
    comment: '用户名',
    type: 'varchar',
    length: 14,
    nullable: false,
    unique: true,
  })
  username: string;

  // select 控制隐藏列
  // 如果要查询的模型具有"select：false"的列，则需要使用addSelect函数来从列中检索信息。
  // .addSelect("user.password")
  // 采用select的方式虽然查询时能隐藏，但.save()返回的结果没有隐藏
  // 若采用此种方式，为免密码暴露，返回的时候需要重新过滤一下，比较容易忘记
  // 所以推荐使用Exclude
  @ApiProperty({ description: '密码' })
  @Exclude()
  @Column({
    comment: '密码',
    // select: false,
    type: 'char',
    length: 60,
    nullable: false,
  })
  password: string;

  @ApiPropertyOptional({ description: '手机号码' })
  @Column({
    comment: '手机号码',
    type: 'char',
    length: 11,
    nullable: true,
  })
  phone: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @Column({
    comment: '邮箱',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  email: string;

  @ApiPropertyOptional({ description: '性别' })
  @Column({
    comment: '性别',
    type: 'tinyint',
    nullable: true,
    default: 0,
  })
  gender: Gender;

  @ApiPropertyOptional({ description: '头像' })
  @Column({
    comment: '头像',
    type: 'char',
    length: 200,
    nullable: true,
  })
  avatar: string;

  @ApiProperty({ description: '用户状态' })
  @Column({
    comment: '用户状态',
    type: 'tinyint',
    nullable: false,
    default: 1,
  })
  status: UserStatus;

  @BeforeInsert()
  async encryptPassword() {
    this.password = await encrypt(this.password);
  }
}
