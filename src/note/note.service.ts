import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NoteService {
  create(createNoteDto: CreateNoteDto) {
    return 'This action adds a new note';
  }
}
