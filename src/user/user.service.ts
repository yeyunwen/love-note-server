import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const hasUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (hasUser) {
      throw new Error('用户已存在');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      uid: this.generateUid(),
    });
    await this.userRepository.save(user);
    return user;
  }
  private generateUid(): string {
    const uid = uuidv4();
    const numericUid = uid
      .replace(/-/g, '')
      .split('')
      .map((char) => char.charCodeAt(0))
      .join('');
    return numericUid.slice(0, 12);
  }

  async bindLover(userUid: string, loverUid: string): Promise<void> {
    if (userUid === loverUid) {
      throw new HttpException('不能绑定自己', 200);
    }
    const user = await this.userRepository.findOne({
      where: { uid: userUid },
    });
    const lover = await this.userRepository.findOne({
      where: { uid: loverUid },
    });
    if (!user || !lover) {
      throw new HttpException('用户不存在', 200);
    }
    if (user.lover || lover.lover) {
      throw new HttpException('用户已有恋人', 200);
    }
    user.loverId = lover.uid;
    lover.loverId = user.uid;
    await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(user);
        await transactionalEntityManager.save(lover);
      },
    );
  }

  async unbindLover(userUid: string) {
    const user = await this.userRepository.findOne({
      where: { uid: userUid },
    });
    if (!user || !user.loverId) {
      throw new HttpException('用户没有恋人', 200);
    }

    const partner = await this.userRepository.findOne({
      where: { uid: user.loverId },
    });
    if (!partner) {
      throw new HttpException('恋人不存在', 200);
    }

    // 解除双方绑定
    user.loverId = null;
    partner.loverId = null;

    // 使用事务保存
    await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(user);
        await transactionalEntityManager.save(partner);
      },
    );
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    updateUserDto;
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
