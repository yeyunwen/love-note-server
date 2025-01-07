import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '~/user/entities/user.entity';
import { UserGender } from '~/user/types';
import { UserService } from '~/user/user.service';

export class SeedUser1736263364449 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const user1 = new User();
    user1.username = 'test1';
    user1.email = 'test1@example.com';
    user1.password = await UserService.hashPassword('123456');
    user1.uid = UserService.generateUid();
    user1.gender = UserGender.男;
    await queryRunner.manager.save(user1);

    const user2 = new User();
    user2.username = 'test2';
    user2.email = 'test2@example.com';
    user2.password = await UserService.hashPassword('123456');
    user2.uid = UserService.generateUid();
    user2.gender = UserGender.女;
    await queryRunner.manager.save(user2);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(User, {
      email: {
        $in: ['test1@example.com', 'test2@example.com'],
      },
    });
  }
}
