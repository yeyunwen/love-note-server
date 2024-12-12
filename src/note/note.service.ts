import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './entities/note.entity';
import { Image } from './entities/image.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note) private readonly noteRepository: Repository<Note>,
  ) {}

  async create(createNoteDto: CreateNoteDto & { userId: number }) {
    const { userId, ...note } = createNoteDto;
    const noteEntity = this.noteRepository.create({
      user: { id: userId },
      ...note,
    });

    if (note.imageIds?.length) {
      noteEntity.images = note.imageIds.map(
        (imageId) =>
          ({
            id: imageId,
          }) as Image,
      );
    }

    const savedNote = await this.noteRepository.save(noteEntity);
    return instanceToPlain(savedNote);
  }
}
