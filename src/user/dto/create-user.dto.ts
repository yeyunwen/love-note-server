import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { UserGender } from '../enum';

export class CreateUserDto {
  @IsNotEmpty({ message: 'username must not be empty' })
  @Length(1, 12, { message: 'username length cant not be more than 12' })
  username: string;

  @IsNotEmpty({ message: 'password must not be empty' })
  @Length(6, 12, { message: 'password length must be between 6 and 12' })
  password: string;

  @IsOptional()
  @IsEnum(UserGender, { message: 'gender must be 0, 1 or 2' })
  gender?: number;
}
