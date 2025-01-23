#!/bin/bash

# 启用错误检查
set -e

echo "开始设置服务器环境..."

# 更新系统包
sudo -S apt-get update
sudo -S apt-get upgrade -y

# 安装必要的软件包
sudo -S apt-get install -y curl nginx

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo -S apt-get install -y nodejs

# 安装 PM2
sudo -S npm install -g pm2

# 安装 MongoDB 6.0
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo -S apt-get update
sudo -S apt-get install -y mongodb-org

# 启动 MongoDB
sudo -S systemctl start mongod
sudo -S systemctl enable mongod

# 安装 Nginx
sudo -S apt-get install -y nginx

# 配置 Nginx
sudo -S tee /etc/nginx/sites-available/green-identify << 'EOF'
server {
    listen 80;
    server_name _;  # 替换为你的域名

    # 前端静态文件
    location / {
        root /var/www/green-identify;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用网站配置
sudo -S ln -sf /etc/nginx/sites-available/green-identify /etc/nginx/sites-enabled/
sudo -S rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
sudo -S nginx -t

# 重启 Nginx
sudo -S systemctl restart nginx

# 配置防火墙
sudo -S ufw allow ssh
sudo -S ufw allow http
sudo -S ufw allow https
sudo -S ufw --force enable

# 创建应用目录
sudo -S mkdir -p /var/www/green-identify
sudo -S chown -R $USER:$USER /var/www/green-identify

echo "基础环境设置完成！"
echo "接下来需要："
echo "1. 配置环境变量"
echo "2. 部署应用代码"
echo "3. 配置 SSL 证书"
