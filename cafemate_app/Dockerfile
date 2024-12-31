# 使用輕量基礎映像作為構建階段
FROM node:18-alpine AS builder

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install --production=false

# 複製剩餘文件
COPY . .

# 構建應用
RUN npm run build

# 使用最小化的 Node.js 映像作為運行階段
FROM node:18-alpine AS runner

# 設定工作目錄
WORKDIR /app

# 從構建階段複製產生的文件
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# 設定環境變數
ENV NODE_ENV=production

# 暴露應用運行的端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"]
