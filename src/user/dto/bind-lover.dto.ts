import { IsNotEmpty } from 'class-validator';

export class BindLoverDto {
  @IsNotEmpty({ message: 'loverUid must not be empty' })
  loverUid: string;
}

export class AcceptLoverDto {
  @IsNotEmpty({ message: 'loverUid must not be empty' })
  loverUid: string;
}
