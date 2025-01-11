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

    // 先创建 note
    const noteEntity = this.noteRepository.create({
      user: { id: userId },
      ...note,
    });
    const savedNote = await this.noteRepository.save(noteEntity);

    // 先建立关系
    await this.noteRepository
      .createQueryBuilder()
      .relation(Note, 'images')
      .of(savedNote)
      .add(imageIds);

    // 然后更新每个图片的 order
    await Promise.all(
      imageIds.map((imageId, index) =>
        this.noteRepository.manager
          .createQueryBuilder()
          .update('note_image')
          .set({ order: index })
          .where('id = :id AND noteId = :noteId', {
            id: imageId,
            noteId: savedNote.id,
          })
          .execute(),
      ),
    );

    return this.findOne(savedNote.id);
  }

  async findAllForUser(userId: number, query: PaginationQueryDto) {
    // 先获取分页后的笔记
    const [notes, total] = await this.noteRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      order: { createdTime: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    // 为每个笔记加载其关联的图片，并按顺序排序
    const notesWithImages = await Promise.all(
      notes.map(async (note) => {
        const images = await this.loadImagesForNote(note.id);
        return {
          ...note,
          images,
        };
      }),
    );

    return {
      items: notesWithImages,
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
      order: {
        images: {
          order: 'ASC',
        },
      },
    });
    return note;
  }

  private async loadImagesForNote(noteId: number) {
    return this.noteRepository
      .createQueryBuilder('note')
      .relation(Note, 'images')
      .of(noteId)
      .loadMany()
      .then((images) => images.sort((a, b) => a.order - b.order));
  }
}
