import {
  IsEnum,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserGender, UserRegisterType } from '../types';

export class CreateUserEmailDto {
  @IsNotEmpty({ message: 'email must not be empty' })
  @IsEmail({}, { message: 'email must be a valid email' })
  email: string;

  @IsNotEmpty({ message: 'password must not be empty' })
  @Length(6, 12, { message: 'password length must be between 6 and 12' })
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
  gender?: number;
}

export class RegisterDto {
  @IsEnum(UserRegisterType)
  type: UserRegisterType;

  @ValidateNested()
  @IsOptional()
  emailData?: CreateUserEmailDto;
}
