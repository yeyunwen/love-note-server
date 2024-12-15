import { Post, Body, Get } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { User } from '~/common/decorators/user.decorator';
import { JwtPayload } from '~/common/types';
import { ApiController } from '~/common/decorators/api-controller.decorator';

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
   * 获取用户所有笔记
   */
  @Get()
  findUserNotes(@User() { userId }: JwtPayload) {
    return this.noteService.findAllForUser(userId);
  }
}
