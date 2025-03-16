import { MigrationInterface, QueryRunner } from 'typeorm';
import fs from 'fs';
import path from 'path';

export class Init1731955927328 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 读取 SQL 文件
    const sqlFilePath = path.join(__dirname, 'love-note.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // 分割 SQL 语句并执行
    // 注意：这种分割方式可能不适用于所有 SQL 文件，特别是包含存储过程等的文件
    const statements = sqlContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
      .split(';')
      .filter((statement) => statement.trim().length > 0);

    for (const statement of statements) {
      try {
        await queryRunner.query(statement + ';');
      } catch (error) {
        console.error(`Error executing statement: ${statement}`);
        console.error(error);
        throw error;
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP DATABASE love-note;');
  }
}
