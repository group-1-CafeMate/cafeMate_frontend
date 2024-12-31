# 使用官方 Node.js 圖像作為基礎
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製剩餘文件
COPY . .

# 構建 Next.js 應用
RUN npm run build

# 暴露應用運行的端口
EXPOSE 3000

# 啟動 Next.js 應用
CMD ["npm", "start"]
