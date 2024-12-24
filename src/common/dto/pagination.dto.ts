import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
  /**
   * 当前页码
   * @example 1
   * @default 1
   * @minimum 1
   */
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 1 : parsed;
  })
  @IsInt()
  @Min(1, { message: '页码必须大于等于 1' })
  readonly page: number = 1;

  /**
   * 每页条数
   * @example 10
   * @default 10
   * @minimum 1
   */
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 10 : parsed;
  })
  @IsInt()
  @Min(1, { message: '每页条数必须大于等于 1' })
  limit: number = 10;
}
