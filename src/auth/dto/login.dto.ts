import { IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginEmailDto {
  @IsEmail()
  @ApiProperty({
    description: '邮箱',
    example: '1571374338@qq.com',
  })
  email: string;

  @Length(6, 12, { message: 'password length must be between 6 and 12' })
  @ApiProperty({
    description: '密码',
    example: '123456',
  })
  password: string;
}
