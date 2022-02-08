import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateEntity } from 'src/common/entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AppStatus, AppThemeColor } from '../type';

@Entity()
export class App extends DateEntity {
  @ApiProperty({ description: '应用编号' })
  @PrimaryGeneratedColumn({
    comment: '应用编号',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @ApiPropertyOptional({ description: '应用标题' })
  @Column({
    comment: '应用标题',
    type: 'varchar',
    nullable: false,
  })
  title: string;

  @ApiPropertyOptional({ description: '应用简介' })
  @Column({
    comment: '应用简介',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  description: string;

  @ApiProperty({ description: '应用图标' })
  @Column({
    comment: '应用图标',
    type: 'varchar',
    nullable: false,
  })
  icon: string;

  @ApiPropertyOptional({ description: '应用状态' })
  @Column({
    comment: '应用状态',
    type: 'tinyint',
    nullable: true,
    default: AppStatus.OFF_LINE,
  })
  status: AppStatus;

  @ApiProperty({ description: '应用主题颜色' })
  @Column({
    name: 'theme_color',
    comment: '应用主题颜色',
    type: 'tinyint',
    nullable: true,
    default: AppThemeColor.BLUE
  })
  themeColor: AppThemeColor;

  @ApiPropertyOptional({ description: '应用模板编号' })
  @Column({
    name: 'template_id',
    comment: '应用模板编号',
    type: 'int',
    nullable: true,
  })
  templateId: number;

  @ApiProperty({ description: '应用创建者编号' })
  @Column({
    name: 'creator_id',
    comment: '应用创建者编号',
    type: 'int',
    nullable: true,
  })
  creatorId: number;

  @ApiProperty({ description: '应用最后编辑者编号' })
  @Column({
    name: 'last_editor',
    comment: '应用最后编辑者编号',
    type: 'int',
    nullable: true,
  })
  lastEditor: number;
}
