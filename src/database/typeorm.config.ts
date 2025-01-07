import { DataSource } from 'typeorm';
import GLOBAL_CONFIG from '~/common/config';

export default new DataSource({
  type: 'mysql',
  host: GLOBAL_CONFIG.MYSQL_CONFIG.HOST,
  port: GLOBAL_CONFIG.MYSQL_CONFIG.PORT,
  username: GLOBAL_CONFIG.MYSQL_CONFIG.USER,
  password: GLOBAL_CONFIG.MYSQL_CONFIG.PASSWORD,
  database: GLOBAL_CONFIG.MYSQL_CONFIG.DATABASE,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/**/*{.ts,.js}'],
  synchronize: false,
});
