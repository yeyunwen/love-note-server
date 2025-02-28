import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum LoverRequestStatus {
  待处理 = '待处理',
  已接受 = '已接受',
  已拒绝 = '已拒绝',
}

@Entity()
export class LoverRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_uid', referencedColumnName: 'uid' })
  sender: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_uid', referencedColumnName: 'uid' })
  receiver: User;

  @Column({
    type: 'enum',
    enum: LoverRequestStatus,
    default: LoverRequestStatus.待处理,
  })
  status: LoverRequestStatus;

  @CreateDateColumn({ comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedTime: Date;
}
