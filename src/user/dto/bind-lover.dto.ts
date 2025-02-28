import { IsNotEmpty } from 'class-validator';

export class BindLoverDto {
  @IsNotEmpty({ message: 'loverUid must not be empty' })
  loverUid: string;
}

export class AcceptLoverDto {
  @IsNotEmpty({ message: 'requestId must not be empty' })
  requestId: number;
}

export class RejectLoverDto {
  @IsNotEmpty({ message: 'requestId must not be empty' })
  requestId: number;
}
