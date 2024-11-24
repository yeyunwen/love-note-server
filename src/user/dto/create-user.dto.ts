import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { UserGender } from '../enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty({ message: 'username must not be empty' })
  @Length(1, 12, { message: 'username length cant not be more than 12' })
  username: string;

  @IsNotEmpty({ message: 'password must not be empty' })
  @Length(6, 12, { message: 'password length must be between 6 and 12' })
  password: string;

  @ApiProperty({
    enum: UserGender,
    default: UserGender.未知,
    description: '性别 0:未知 1:男 2:女',
  })
  @IsOptional()
  @IsEnum(UserGender, { message: 'gender must be 0, 1 or 2' })
  gender?: number;
}
