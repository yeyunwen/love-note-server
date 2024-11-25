import { IsEmail, Length } from 'class-validator';

export class LoginEmailDto {
  @IsEmail()
  email: string;

  @Length(6, 12, { message: 'password length must be between 6 and 12' })
  password: string;
}
