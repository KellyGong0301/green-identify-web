#!/bin/bash

# 启用错误检查
set -e

# 确保目录存在
sudo mkdir -p /var/www/green-identify
sudo chown -R $USER:$USER /var/www/green-identify

# 进入项目目录
cd /var/www/green-identify

# 克隆或更新代码
if [ ! -d ".git" ]; then
    # 首次部署，克隆代码
    git clone https://github.com/KellyGong0301/green-identify-web.git .
else
    # 更新代码
    git pull origin main
fi

# 创建前端环境变量文件
cat > .env << EOF
# Bing Search API
VITE_BING_SEARCH_API_KEY=${BING_SEARCH_API_KEY}
VITE_BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0

# Plant.id API
VITE_PLANT_ID_API_KEY=${PLANT_ID_API_KEY}

# Azure OpenAI API
VITE_AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
VITE_AZURE_OPENAI_KEY=${AZURE_OPENAI_KEY}
VITE_AZURE_OPENAI_DEPLOYMENT_ID=${AZURE_OPENAI_DEPLOYMENT_ID}

# API Configuration
VITE_API_PORT=3001
EOF

# 创建后端环境变量文件
cat > server/.env << EOF
# Database
DATABASE_URL="mongodb://localhost:27017/green-identify"

# JWT
JWT_SECRET=${JWT_SECRET:-"your-super-secret-jwt-key"}

# Server
PORT=3001

# Bing Search API
BING_SEARCH_API_KEY=${BING_SEARCH_API_KEY}
BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0

# Plant.id API
PLANT_ID_API_KEY=${PLANT_ID_API_KEY}

# Azure OpenAI API
AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
AZURE_OPENAI_KEY=${AZURE_OPENAI_KEY}
AZURE_OPENAI_DEPLOYMENT_ID=${AZURE_OPENAI_DEPLOYMENT_ID}
EOF

# 安装前端依赖并构建
npm install
npm run build

# 将构建后的前端文件移动到 Nginx 目录
sudo rm -rf /var/www/green-identify/dist
sudo cp -r dist /var/www/green-identify/

# 进入后端目录并部署
cd server

# 安装后端依赖
npm install

# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy

# 构建后端
npm run build

# 使用 PM2 启动后端服务
pm2 delete green-identify-api || true
pm2 start dist/server.js --name "green-identify-api"

# 保存 PM2 进程列表
pm2 save

echo "部署完成！"
