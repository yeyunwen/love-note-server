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
const getConfig = () => {
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

const config = getConfig();

// 全局配置 为了部署到线上的时候，可以获取到.env 文件中的配置
const GLOBAL_CONFIG: AppConfig = {
  SERVER_CONFIG: {
    PORT: Number(process.env.SERVER_PORT) || config.SERVER_CONFIG.PORT,
  },
  MYSQL_CONFIG: {
    USER: process.env.MYSQL_USER || config.MYSQL_CONFIG.USER,
    PASSWORD: process.env.MYSQL_PASSWORD || config.MYSQL_CONFIG.PASSWORD,
    HOST: process.env.MYSQL_HOST || config.MYSQL_CONFIG.HOST,
    PORT: Number(process.env.MYSQL_PORT) || config.MYSQL_CONFIG.PORT,
    DATABASE: process.env.MYSQL_DATABASE || config.MYSQL_CONFIG.DATABASE,
  },
  AUTH_CONFIG: {
    JWT_SECRET: process.env.JWT_SECRET || config.AUTH_CONFIG.JWT_SECRET,
    JWT_EXPIRES_IN:
      process.env.JWT_EXPIRES_IN || config.AUTH_CONFIG.JWT_EXPIRES_IN,
  },
  EMAIL_CONFIG: {
    USER: process.env.EMAIL_USER || config.EMAIL_CONFIG.USER,
    PASS: process.env.EMAIL_PASS || config.EMAIL_CONFIG.PASS,
  },
  REDIS_CONFIG: {
    HOST: process.env.REDIS_HOST || config.REDIS_CONFIG.HOST,
    PORT: Number(process.env.REDIS_PORT) || config.REDIS_CONFIG.PORT,
  },
  UPLOAD_CONFIG: {
    MAX_FILE_SIZE:
      Number(process.env.UPLOAD_MAX_FILE_SIZE) ||
      config.UPLOAD_CONFIG.MAX_FILE_SIZE,
    MAX_FILE_COUNT:
      Number(process.env.UPLOAD_MAX_FILE_COUNT) ||
      config.UPLOAD_CONFIG.MAX_FILE_COUNT,
    DESTINATION:
      process.env.UPLOAD_DESTINATION || config.UPLOAD_CONFIG.DESTINATION,
  },
};

export default GLOBAL_CONFIG;
