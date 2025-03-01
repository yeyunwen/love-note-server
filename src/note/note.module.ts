import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { Note } from './entities/note.entity';
import { Image } from './entities/image.entity';
import { User } from '~/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note, Image, User])],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
