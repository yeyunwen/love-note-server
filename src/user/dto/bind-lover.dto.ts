import { IsNotEmpty } from 'class-validator';

export class BindLoverDto {
  @IsNotEmpty({ message: 'userUid must not be empty' })
  userUid: string;

  @IsNotEmpty({ message: 'loverUid must not be empty' })
  loverUid: string;
}
