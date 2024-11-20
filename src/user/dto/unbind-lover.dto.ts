import { IsNotEmpty } from 'class-validator';

export class UnbindLoverDto {
  @IsNotEmpty({ message: 'uid不能为空' })
  uid: string;
}
