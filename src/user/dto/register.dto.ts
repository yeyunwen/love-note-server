import {
  IsEnum,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserGender, UserRegisterType } from '~/user/types';

export class CreateUserEmailDto {
  @IsNotEmpty({ message: 'email must not be empty' })
  @IsEmail({}, { message: 'email must be a valid email' })
  @ApiProperty({
    description: '邮箱',
    example: '1571374338@qq.com',
  })
  email: string;

  @IsNotEmpty({ message: 'password must not be empty' })
  @Length(6, 12, { message: 'password length must be between 6 and 12' })
  @ApiProperty({
    description: '密码',
    example: '123456',
  })
  password: string;

  @IsNotEmpty({ message: 'verifyCode must not be empty' })
  verifyCode: string;

  @ApiProperty({
    enum: UserGender,
    default: UserGender.未知,
    description: '性别 0:未知 1:男 2:女',
  })
  @IsOptional()
  @IsEnum(UserGender, { message: 'gender must be 0, 1 or 2' })
  gender?: UserGender;
}

export class RegisterDto {
  @IsEnum(UserRegisterType)
  type: UserRegisterType;

  @ValidateNested()
  @IsOptional()
  emailData?: CreateUserEmailDto;
}
// 定义注册数据类型映射
export type RegisterDataMap = {
  [UserRegisterType.邮箱]: CreateUserEmailDto;
};
