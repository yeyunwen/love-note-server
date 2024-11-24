import { IsEmail } from 'class-validator';

export class SendEmailVerifyCodeDto {
  @IsEmail()
  address: string;
}
