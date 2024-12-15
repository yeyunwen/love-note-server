import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note) private readonly noteRepository: Repository<Note>,
  ) {}

  async create(createNoteDto: CreateNoteDto & { userId: number }) {
    const { userId, imageIds, ...note } = createNoteDto;
    const noteEntity = this.noteRepository.create({
      user: { id: userId },
      images: imageIds.map((imageId) => ({ id: imageId })),
      ...note,
    });

    const savedNote = await this.noteRepository.save(noteEntity);
    return savedNote;
  }

  async findAllForUser(userId: number) {
    const notes = await this.noteRepository.find({
      where: { user: { id: userId } },
      relations: ['images'],
    });
    return instanceToPlain(notes);
  }
}
