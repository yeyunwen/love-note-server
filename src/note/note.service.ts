import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './entities/note.entity';
import { PaginationQueryDto } from '~/common/dto/pagination.dto';

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

  async findAllForUser(userId: number, query: PaginationQueryDto) {
    const [notes, total] = await this.noteRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['images', 'user'],
      select: {
        user: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { createdTime: 'DESC' },
    });

    return {
      items: notes,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: number) {
    const note = await this.noteRepository.findOne({
      where: { id },
      relations: ['images', 'user'],
      select: {
        user: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    });
    return note;
  }
}
