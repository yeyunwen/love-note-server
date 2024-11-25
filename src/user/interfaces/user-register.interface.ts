import { CreateUserEmailDto } from '../dto/register.dto';
import { UserRegisterType } from '../enum';

// 定义注册数据类型映射
export type RegisterDataMap = {
  [UserRegisterType.邮箱]: CreateUserEmailDto;
};

export interface IUserRegister<T extends UserRegisterType> {
  type: T;
  register(data: RegisterDataMap[T]): Promise<void>;
}
