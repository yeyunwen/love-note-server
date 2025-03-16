import { parse } from 'yaml';
import path from 'node:path';
import fs from 'node:fs';
import { AppConfig } from '~/common/types';

type Env = 'dev' | 'test' | 'prod';

// 获取项目运行环境
export const getEnv = (): Env => {
  return (process.env.RUNNING_ENV as Env) || 'dev';
};

export const isDev = getEnv() === 'dev';

// 读取项目配置
const getFileConfig = () => {
  const env = getEnv();
  const envPath = path.join(process.cwd(), `./.config/.${env}.yaml`);
  const localPath = path.join(process.cwd(), `./.config/.${env}.local.yaml`);
  const envConfig = parse(fs.readFileSync(envPath, 'utf8'));
  let localConfig = {};
  if (fs.existsSync(localPath)) {
    localConfig = parse(fs.readFileSync(localPath, 'utf8'));
  }

  const config = { ...envConfig, ...localConfig };

  return config as AppConfig;
};

const fileConfig = getFileConfig();

// 全局配置 为了部署到线上的时候，可以获取到.env 文件中的配置
const GLOBAL_CONFIG: AppConfig = {
  SERVER_CONFIG: {
    PORT: Number(process.env.SERVER_PORT) || fileConfig.SERVER_CONFIG.PORT,
  },
  MYSQL_CONFIG: {
    USER: process.env.MYSQL_USER || fileConfig.MYSQL_CONFIG.USER,
    PASSWORD: process.env.MYSQL_PASSWORD || fileConfig.MYSQL_CONFIG.PASSWORD,
    HOST: process.env.MYSQL_HOST || fileConfig.MYSQL_CONFIG.HOST,
    PORT: Number(process.env.MYSQL_PORT) || fileConfig.MYSQL_CONFIG.PORT,
    DATABASE: process.env.MYSQL_DATABASE || fileConfig.MYSQL_CONFIG.DATABASE,
  },
  AUTH_CONFIG: {
    JWT_SECRET: process.env.JWT_SECRET || fileConfig.AUTH_CONFIG.JWT_SECRET,
    JWT_EXPIRES_IN:
      process.env.JWT_EXPIRES_IN || fileConfig.AUTH_CONFIG.JWT_EXPIRES_IN,
  },
  EMAIL_CONFIG: {
    USER: process.env.EMAIL_USER || fileConfig.EMAIL_CONFIG.USER,
    PASS: process.env.EMAIL_PASS || fileConfig.EMAIL_CONFIG.PASS,
  },
  REDIS_CONFIG: {
    HOST: process.env.REDIS_HOST || fileConfig.REDIS_CONFIG.HOST,
    PORT: Number(process.env.REDIS_PORT) || fileConfig.REDIS_CONFIG.PORT,
  },
  UPLOAD_CONFIG: {
    MAX_FILE_SIZE:
      Number(process.env.UPLOAD_MAX_FILE_SIZE) ||
      fileConfig.UPLOAD_CONFIG.MAX_FILE_SIZE,
    MAX_FILE_COUNT:
      Number(process.env.UPLOAD_MAX_FILE_COUNT) ||
      fileConfig.UPLOAD_CONFIG.MAX_FILE_COUNT,
    DESTINATION:
      process.env.UPLOAD_DESTINATION || fileConfig.UPLOAD_CONFIG.DESTINATION,
  },
};

export default GLOBAL_CONFIG;
