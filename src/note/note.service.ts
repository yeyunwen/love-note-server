import { Repository } from 'typeorm';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './entities/note.entity';
import { PaginationQueryDto } from '~/common/dto/pagination.dto';
import { User } from '~/user/entities/user.entity';
import { Image } from '~/note/entities/image.entity';
import { In } from 'typeorm';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note) private readonly noteRepository: Repository<Note>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async create(createNoteDto: CreateNoteDto & { userId: number }) {
    // 1. 检查用户是否已绑定恋人并获取relationshipId
    const user = await this.userRepository.findOne({
      where: { id: createNoteDto.userId },
    });

    if (!user.relationshipId) {
      throw new HttpException(
        '请先绑定恋人后再发布笔记',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. 创建笔记
    const { userId, imageIds, ...note } = createNoteDto;
    const noteEntity = this.noteRepository.create({
      user: { id: userId },
      relationshipId: user.relationshipId,
      ...note,
    });
    const savedNote = await this.noteRepository.save(noteEntity);

    // 4. 建立图片关系
    if (imageIds && imageIds.length > 0) {
      await this.imageRepository.update(
        { id: In(imageIds) },
        { noteId: savedNote.id },
      );
    }

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

  async findLoverNotes(userUid: string, query: PaginationQueryDto) {
    // 1. 获取用户和其恋人信息
    const user = await this.userRepository.findOne({
      where: { uid: userUid },
      relations: ['lover'],
    });

    if (!user.lover) {
      throw new HttpException('您还没有绑定恋人', HttpStatus.BAD_REQUEST);
    }

    // 2. 生成关系ID
    const relationshipId = [user.uid, user.lover.uid].sort().join('_');

    // 3. 查询关系下的所有笔记
    const [notes, total] = await this.noteRepository.findAndCount({
      where: { relationshipId },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      order: { updatedTime: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    // 4. 为每个笔记加载图片
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
}
