import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserGender } from '../enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: 'uid' })
  uid: string;

  @Column({ length: 60, comment: '用户名' })
  username: string;

  @Column({ length: 255, comment: '密码' })
  password: string;

  @Column({
    type: 'enum',
    enum: UserGender,
    default: UserGender.未知,
    comment: '性别 0:未知 1:男 2:女',
  })
  gender: number;

  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lover_uid' })
  lover: User;

  @Column({ nullable: true, comment: '恋人uid' })
  loverUid: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedTime: Date;
}
