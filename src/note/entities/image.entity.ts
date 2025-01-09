import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Note } from './note.entity';

@Entity('note_image')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '图片URL' })
  url: string;

  @Column({ comment: '图片宽度' })
  width: number;

  @Column({ comment: '图片高度' })
  height: number;

  @Column({ name: 'noteId', nullable: true }) // 添加 noteId 列
  noteId: number;

  @Column({ name: 'order', default: 0 })
  order: number;

  @ManyToOne(() => Note, (note) => note.images)
  note: Note;

  @CreateDateColumn({ comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedTime: Date;
}
