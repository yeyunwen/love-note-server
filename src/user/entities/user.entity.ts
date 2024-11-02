import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { hash } from 'bcrypt';
import { UserGender } from '../enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 60, comment: '用户名' })
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

  @CreateDateColumn({ comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedTime: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }
}
