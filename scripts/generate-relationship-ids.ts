import * as path from 'path';
import moduleAlias from 'module-alias';
import { DataSource } from 'typeorm';

// 解决路径别名问题
moduleAlias.addAliases({
  '~': path.join(__dirname, '../src'),
});

import { User } from '~/user/entities/user.entity';
import { LoverRequest } from '~/user/entities/lover-request.entity';
import { Note } from '~/note/entities/note.entity';
import { Image } from '~/note/entities/image.entity';
import GLOBAL_CONFIG from '~/common/config';

async function generateRelationshipIds() {
  console.log('开始为现有情侣关系生成 relationshipId...');

  // 创建数据源
  const dataSource = new DataSource({
    type: 'mysql',
    host: GLOBAL_CONFIG.MYSQL_CONFIG.HOST,
    port: GLOBAL_CONFIG.MYSQL_CONFIG.PORT,
    username: GLOBAL_CONFIG.MYSQL_CONFIG.USER,
    password: GLOBAL_CONFIG.MYSQL_CONFIG.PASSWORD,
    database: GLOBAL_CONFIG.MYSQL_CONFIG.DATABASE,
    entities: [User, LoverRequest, Note, Image], // 包含所有相关实体
    synchronize: false, // 确保不会自动同步数据库结构
  });

  // 初始化连接
  await dataSource.initialize();
  console.log('数据库连接已建立');

  try {
    // 查找所有已绑定恋人的用户
    const usersWithLover = await dataSource.manager
      .createQueryBuilder(User, 'user')
      .leftJoinAndSelect('user.lover', 'lover')
      .where('user.lover_uid IS NOT NULL')
      .andWhere('user.relationshipId IS NULL')
      .getMany();

    console.log(
      `找到 ${usersWithLover.length} 个已绑定恋人但没有 relationshipId 的用户`,
    );

    // 处理过的用户 uid 集合，避免重复处理
    const processedUids = new Set<string>();

    // 为每对情侣生成 relationshipId
    for (const user of usersWithLover) {
      // 如果已处理过该用户，跳过
      if (processedUids.has(user.uid)) continue;

      // 生成 relationshipId
      const relationshipId = [user.uid, user.lover.uid].sort().join('_');

      console.log(
        `为用户 ${user.username} 和 ${user.lover.username} 生成 relationshipId: ${relationshipId}`,
      );

      // 更新两个用户的 relationshipId
      await dataSource.manager
        .createQueryBuilder()
        .update(User)
        .set({ relationshipId })
        .where('uid IN (:...uids)', { uids: [user.uid, user.lover.uid] })
        .execute();

      // 标记这两个用户为已处理
      processedUids.add(user.uid);
      processedUids.add(user.lover.uid);
    }

    console.log(`成功为 ${processedUids.size} 个用户生成 relationshipId`);
  } catch (error) {
    console.error('生成 relationshipId 时出错:', error);
  } finally {
    // 关闭数据库连接
    await dataSource.destroy();
    console.log('数据库连接已关闭');
  }
}

// 执行脚本
generateRelationshipIds()
  .then(() => console.log('脚本执行完成'))
  .catch((error) => console.error('脚本执行失败:', error));
