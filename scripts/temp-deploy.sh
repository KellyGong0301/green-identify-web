#/bin/bash -c 


# 启用错误检查
set -e

# sudo 密码
SUDO_PASS='BingClient1234!'

# 确保目录存在
echo  | sudo -S mkdir -p /var/www/green-identify

# 进入项目目录
cd /var/www/green-identify

# 初始化 Git 仓库（如果不存在）
if [ ! -d ".git" ]; then
    git init
    echo  | sudo -S git config --global --add safe.directory /var/www/green-identify
fi

# 添加所有文件并提交
git add .
git commit -m "Server deployment" || true

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
JWT_SECRET=${JWT_SECRET}

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

echo "安装和构建后端..."
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

# 返回项目根目录
cd ..

echo "安装和构建前端..."
# 安装前端依赖并构建
npm install
npm run build

echo "启动服务..."
# 使用 PM2 启动后端服务
cd server
pm2 delete green-identify-api || true
pm2 start dist/server.js --name "green-identify-api"

echo "部署完成！"
