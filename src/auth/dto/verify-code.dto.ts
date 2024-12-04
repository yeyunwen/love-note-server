import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendEmailVerifyCodeDto {
  @IsEmail()
  @ApiProperty({
    description: '邮箱',
    example: '1571374338@qq.com',
  })
  address: string;
}
