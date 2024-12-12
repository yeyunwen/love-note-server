import { IsString, IsNotEmpty, Length, IsArray } from 'class-validator';

export class CreateNoteDto {
  /** 文章标题 */
  @IsString({ message: '文章标题必须为字符串' })
  @Length(1, 25, { message: '文章标题长度必须在1到255之间' })
  title: string;

  /** 文章内容 */
  @IsString({ message: '文章内容必须为字符串' })
  @IsNotEmpty({ message: '文章内容不能为空' })
  content: string;

  /** 图片Id数组 */
  @IsArray({ message: '图片Id数组必须为数组' })
  imageIds: number[];
}
