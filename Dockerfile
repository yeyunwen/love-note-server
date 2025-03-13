# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm 并设置镜像源
RUN npm install -g pnpm && \
    npm config set registry https://registry.npmmirror.com && \
    pnpm config set registry https://registry.npmmirror.com

# 安装所有依赖
RUN pnpm install

# 复制源代码和配置文件
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 安装 pnpm 并设置镜像源
RUN npm install -g pnpm && \
    npm config set registry https://registry.npmmirror.com && \
    pnpm config set registry https://registry.npmmirror.com

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install

# 从构建阶段复制构建后的文件和配置
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.config ./.config
COPY --from=builder /app/uploads ./uploads

# 创建上传文件目录并设置权限
RUN mkdir -p uploads/note-image && \
    chown -R node:node /app

# 使用非 root 用户
USER node

# 暴露端口
EXPOSE 9315

# 启动应用
CMD ["pnpm", "start:prod"]

