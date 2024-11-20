import { parse } from 'yaml';
import path from 'node:path';
import fs from 'node:fs';
import { AppConfig } from '../types';

type Env = 'dev' | 'test' | 'prod';

// 获取项目运行环境
export const getEnv = (): Env => {
  return process.env.RUNNING_ENV as Env;
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

export default getConfig();
