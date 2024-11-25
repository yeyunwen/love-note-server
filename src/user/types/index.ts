import { CreateUserEmailDto } from '../dto/register.dto';

export enum UserGender {
  未知 = 0,
  男 = 1,
  女 = 2,
}

export enum UserRegisterType {
  邮箱 = 'EMAIL',
}

// 定义注册数据类型映射
export type RegisterDataMap = {
  [UserRegisterType.邮箱]: CreateUserEmailDto;
};

export interface IUserRegister<T extends UserRegisterType> {
  type: T;
  register(data: RegisterDataMap[T]): Promise<void>;
}
