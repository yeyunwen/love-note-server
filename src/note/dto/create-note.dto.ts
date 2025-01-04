import {
  IsString,
  Length,
  IsArray,
  IsOptional,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';

export class CreateNoteDto {
  /** 文章标题 */
  @IsOptional()
  @IsString({ message: '文章标题必须为字符串' })
  @Length(0, 20, { message: '文章标题不能超过20个字符' })
  title?: string;

  /** 文章内容 */
  @IsOptional()
  @IsString({ message: '文章内容必须为字符串' })
  content?: string;

  /** 图片Id数组 */
  @IsArray({ message: '图片Id数组必须为数组' })
  @ArrayMinSize(1, { message: '图片数量不能为空' })
  @IsNumber({}, { each: true, message: '图片Id数组中的每个元素必须为数字' })
  imageIds: number[];
}
