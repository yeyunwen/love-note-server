export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export interface _Config {
  SERVER_CONFIG: {
    /** 应用服务端口 */
    PORT: number;
  };

  MYSQL_CONFIG: {
    /** 数据库用户名 */
    USER: string;
    /** 数据库密码 */
    PASSWORD: string;
    /** 数据库地址 */
    HOST: string;
    /** 数据库端口 */
    PORT: number;
    /** 数据库名称 */
    DATABASE: string;
  };

  AUTH_CONFIG: {
    /** JWT 密钥 */
    JWT_SECRET: string;
    /** JWT 过期时间 */
    JWT_EXPIRES_IN: string;
  };

  EMAIL_CONFIG: {
    /** 邮箱 */
    USER: string;
    /** 邮箱授权码 */
    PASS: string;
  };

  REDIS_CONFIG: {
    /** Redis 地址 */
    HOST: string;
    /** Redis 端口 */
    PORT: number;
  };

  UPLOAD_CONFIG: {
    /** 最大文件大小 10(MB) */
    MAX_FILE_SIZE: number;
    /** 最大文件数量 9 */
    MAX_FILE_COUNT: number;
    /** 文件存储路径 uploads */
    DESTINATION: string;
  };
}

export type AppConfig = DeepReadonly<_Config>;

export type JwtPayload = {
  userId: number;
  uid: string;
  username: string;
};
