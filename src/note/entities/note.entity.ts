import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { User } from '~/user/entities/user.entity';
import { Image } from './image.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, comment: '文章标题' })
  title: string;

  @Column({ type: 'text', comment: '文章内容' })
  content: string;

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => Image, (image) => image.note)
  @Transform(({ value }) => value?.map((image) => ({ id: image.id })))
  images: Image[];

  @CreateDateColumn({ comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedTime: Date;
}
