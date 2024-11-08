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
}

export type AppConfig = DeepReadonly<_Config>;
