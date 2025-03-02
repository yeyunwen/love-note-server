import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '~/common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export enum NoteType {
  /** 全部笔记 */
  全部 = '全部',
  /** 我的笔记 */
  我的 = '我的',
  /** 恋人的笔记 */
  恋人 = '恋人的',
}

export class FindNotesDto extends PaginationQueryDto {
  /**
   * 笔记类型
   * @default 全部
   */
  @IsOptional()
  @IsEnum(NoteType)
  @ApiProperty({
    enum: NoteType,
    default: NoteType.全部,
    required: false,
    description: '笔记类型',
  })
  type?: NoteType = NoteType.全部;
}
