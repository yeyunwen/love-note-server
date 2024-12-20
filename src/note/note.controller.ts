import { Post, Body, Get, Query } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { User } from '~/common/decorators/user.decorator';
import { JwtPayload } from '~/common/types';
import { ApiController } from '~/common/decorators/api-controller.decorator';
import { PaginationQueryDto } from '~/common/dto/pagination.dto';

@ApiController({ path: 'note', tags: '笔记' })
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  /**
   * 创建笔记
   */
  @Post()
  create(@User() { userId }: JwtPayload, @Body() createNoteDto: CreateNoteDto) {
    return this.noteService.create({ userId, ...createNoteDto });
  }

  /**
   * 分页获取用户笔记
   */
  @Get()
  findUserNotes(
    @User() { userId }: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.noteService.findAllForUser(userId, query);
  }
}
