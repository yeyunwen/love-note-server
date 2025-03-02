import { Repository } from 'typeorm';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './entities/note.entity';
import { User } from '~/user/entities/user.entity';
import { Image } from '~/note/entities/image.entity';
import { In } from 'typeorm';
import { FindNotesDto, NoteType } from './dto/find-notes.dto';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note) private readonly noteRepository: Repository<Note>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  private async loadImagesForNote(noteId: number) {
    return this.noteRepository
      .createQueryBuilder('note')
      .relation(Note, 'images')
      .of(noteId)
      .loadMany()
      .then((images) => images.sort((a, b) => a.order - b.order));
  }

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

  async findNotes(userUid: string, userId: number, findNotesDto: FindNotesDto) {
    // 1. 获取用户信息
    const user = await this.userRepository.findOne({
      where: { uid: userUid },
      relations: ['lover'],
    });

    if (!user.relationshipId) {
      throw new HttpException('您还没有绑定恋人', HttpStatus.BAD_REQUEST);
    }

    let whereCondition: any;

    // 2. 根据类型构建查询条件
    switch (findNotesDto.type) {
      case NoteType.全部:
        // 查询该关系下的所有笔记
        whereCondition = { relationshipId: user.relationshipId };
        break;
      case NoteType.我的:
        // 只查询自己的笔记
        whereCondition = {
          relationshipId: user.relationshipId,
          user: { id: userId },
        };
        break;
      case NoteType.恋人:
        // 只查询恋人的笔记
        if (!user.lover) {
          throw new HttpException('您还没有绑定恋人', HttpStatus.BAD_REQUEST);
        }
        whereCondition = {
          relationshipId: user.relationshipId,
          user: { id: user.lover.id },
        };
        break;
    }

    // 3. 执行查询
    const [notes, total] = await this.noteRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      order: { updatedTime: 'DESC' },
      skip: (findNotesDto.page - 1) * findNotesDto.limit,
      take: findNotesDto.limit,
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
        page: findNotesDto.page,
        limit: findNotesDto.limit,
        total,
        totalPages: Math.ceil(total / findNotesDto.limit),
      },
    };
  }
}
