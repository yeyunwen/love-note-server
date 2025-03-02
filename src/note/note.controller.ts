import { Post, Body, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { User } from '~/common/decorators/user.decorator';
import { JwtPayload } from '~/common/types';
import { ApiController } from '~/common/decorators/api-controller.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { FindNotesDto } from './dto/find-notes.dto';

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
   * 查询笔记
   */
  @Get()
  @ApiOperation({ summary: '查询笔记' })
  findNotes(
    @User() { uid, userId }: JwtPayload,
    @Query() findNotesDto: FindNotesDto,
  ) {
    return this.noteService.findNotes(uid, userId, findNotesDto);
  }

  /**
   * 获取笔记详情
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noteService.findOne(id);
  }
}
