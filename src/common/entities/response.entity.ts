import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse<T = null> {
  @ApiProperty({
    default: 200,
    description: '接口状态码',
  })
  code: number = 200;

  @ApiProperty({
    default: null,
    description: '接口数据',
  })
  data: T = null;

  @ApiProperty({
    default: 'ok',
    description: '接口状态消息',
  })
  message: string = 'ok';
}
