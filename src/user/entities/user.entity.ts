import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserGender } from '~/user/types';
import GLOBAL_CONFIG from '~/common/config';
import { LoverRequest } from './lover-request.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: 'uid' })
  uid: string;

  @Column({ unique: true, comment: '邮箱' })
  email: string;

  @Column({
    comment: '头像',
    default: `http://localhost:${GLOBAL_CONFIG.SERVER_CONFIG.PORT}/uploads/default-avatar.png`,
  })
  avatar: string;

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
  gender: UserGender;

  @Column({ nullable: true, comment: '恋人关系ID' })
  relationshipId: string;

  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lover_uid', referencedColumnName: 'uid' })
  lover: User;

  @OneToMany(() => LoverRequest, (request) => request.sender)
  sentRequests: LoverRequest[];

  @OneToMany(() => LoverRequest, (request) => request.receiver)
  receivedRequests: LoverRequest[];

  @CreateDateColumn({ comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedTime: Date;
}
