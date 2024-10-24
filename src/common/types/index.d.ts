export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export interface _Config {
  SERVER_CONFIG: {
    /** 应用服务端口 */
    PORT: number;
  };
}

export type AppConfig = DeepReadonly<_Config>;
