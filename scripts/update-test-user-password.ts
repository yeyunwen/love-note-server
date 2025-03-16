import * as path from 'path';
import moduleAlias from 'module-alias';

// 解决路径别名问题
moduleAlias.addAliases({
  '~': path.join(__dirname, '../src'),
});

import { DataSource } from 'typeorm';
import { User } from '~/user/entities/user.entity';
import { LoverRequest } from '~/user/entities/lover-request.entity';
import { Note } from '~/note/entities/note.entity';
import { Image } from '~/note/entities/image.entity';
import GLOBAL_CONFIG from '~/common/config';
import { UserService } from '~/user/user.service';
async function updateTestUserPassword() {
  console.log('开始更新测试用户密码...');

  // 创建数据源
  const dataSource = new DataSource({
    type: 'mysql',
    host: GLOBAL_CONFIG.MYSQL_CONFIG.HOST,
    port: GLOBAL_CONFIG.MYSQL_CONFIG.PORT,
    username: GLOBAL_CONFIG.MYSQL_CONFIG.USER,
    password: GLOBAL_CONFIG.MYSQL_CONFIG.PASSWORD,
    database: GLOBAL_CONFIG.MYSQL_CONFIG.DATABASE,
    entities: [User, LoverRequest, Note, Image],
    synchronize: false,
  });

  // 初始化连接
  await dataSource.initialize();
  console.log('数据库连接已建立');

  try {
    // 查找测试用户
    const testUser = await dataSource.manager.findOne(User, {
      where: { uid: 'test_uid' },
    });

    if (!testUser) {
      console.log('未找到 uid 为 test_uid 的用户');
      return;
    }

    // 生成新密码的哈希
    const newPasswordHash = await UserService.hashPassword('123456');

    // 更新用户密码
    await dataSource.manager.update(
      User,
      { uid: 'test_uid' },
      { password: newPasswordHash },
    );

    console.log(
      `成功将用户 ${testUser.username} (uid: test_uid) 的密码更新为 123456`,
    );
  } catch (error) {
    console.error('更新密码时出错:', error);
  } finally {
    // 关闭数据库连接
    await dataSource.destroy();
    console.log('数据库连接已关闭');
  }
}

// 执行脚本
updateTestUserPassword()
  .then(() => console.log('脚本执行完成'))
  .catch((error) => console.error('脚本执行失败:', error));
