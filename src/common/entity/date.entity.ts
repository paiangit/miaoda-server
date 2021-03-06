import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class DateEntity {
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    // CURRENT_TIMESTAMP(precision)返回包含当前的时区信息的 TIMESTAMP WITH TIME ZONE 数据类型。
    // permission是精度，可取值0-9。
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updatedAt: Date;
}
