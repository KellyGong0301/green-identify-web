#!/bin/bash

# 启用错误检查和调试输出
set -e
set -x

# 检查配置文件是否存在
CONFIG_FILE="deploy-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "错误：找不到配置文件 $CONFIG_FILE"
    exit 1
fi

# 读取配置
SERVER_IP=$(jq -r '.server.ip' "$CONFIG_FILE")
SERVER_USER=$(jq -r '.server.user' "$CONFIG_FILE")
APP_NAME=$(jq -r '.app.name' "$CONFIG_FILE")

# 读取环境变量
export BING_SEARCH_API_KEY=$(jq -r '.env.BING_SEARCH_API_KEY' "$CONFIG_FILE")
export PLANT_ID_API_KEY=$(jq -r '.env.PLANT_ID_API_KEY' "$CONFIG_FILE")
export AZURE_OPENAI_ENDPOINT=$(jq -r '.env.AZURE_OPENAI_ENDPOINT' "$CONFIG_FILE")
export AZURE_OPENAI_KEY=$(jq -r '.env.AZURE_OPENAI_KEY' "$CONFIG_FILE")
export AZURE_OPENAI_DEPLOYMENT_ID=$(jq -r '.env.AZURE_OPENAI_DEPLOYMENT_ID' "$CONFIG_FILE")
export JWT_SECRET=$(jq -r '.env.JWT_SECRET' "$CONFIG_FILE")

# 设置 SSH 密钥
SSH_KEY="$HOME/.ssh/azure_vm"
SSH_OPTIONS="-i $SSH_KEY -o StrictHostKeyChecking=no"

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

echo "脚本目录: $SCRIPT_DIR"
echo "项目根目录: $PROJECT_ROOT"

echo "正在复制部署脚本到服务器..."
scp $SSH_OPTIONS deploy-setup.sh deploy-app.sh "$SERVER_USER@$SERVER_IP:~"

echo "正在设置服务器环境..."
ssh $SSH_OPTIONS -t "$SERVER_USER@$SERVER_IP" "chmod +x ~/deploy-setup.sh && ~/deploy-setup.sh"

echo "正在复制应用代码到服务器..."

# 检查源目录内容
echo "检查源目录内容..."
ls -la "$PROJECT_ROOT"

# 创建一个本地临时目录用于部署
LOCAL_TEMP_DIR=$(mktemp -d)
echo "本地临时目录: $LOCAL_TEMP_DIR"

echo "准备文件..."
cd "$PROJECT_ROOT"

# 复制所有需要的文件和目录到本地临时目录
cp -r \
    src \
    public \
    certs \
    package.json \
    package-lock.json \
    tsconfig.json \
    tsconfig.node.json \
    vite.config.ts \
    tailwind.config.js \
    postcss.config.js \
    index.html \
    .env.example \
    config.ts \
    ecosystem.config.js \
    "$LOCAL_TEMP_DIR/"

# 复制服务器端代码
mkdir -p "$LOCAL_TEMP_DIR/server"
cp -r \
    server/src \
    server/prisma \
    server/package.json \
    server/package-lock.json \
    server/tsconfig.json \
    server/.env.example \
    "$LOCAL_TEMP_DIR/server/"

# 复制环境变量文件
cp .env "$LOCAL_TEMP_DIR/"
cp server/.env "$LOCAL_TEMP_DIR/server/"

echo "压缩文件..."
cd "$LOCAL_TEMP_DIR"
# 使用 --no-mac-metadata 选项来忽略 macOS 的扩展属性
COPYFILE_DISABLE=1 tar --no-xattrs --no-mac-metadata -czf deploy.tar.gz .
ls -la deploy.tar.gz

# 在服务器上创建临时目录
REMOTE_TEMP_DIR=$(ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "mktemp -d")
echo "远程临时目录: $REMOTE_TEMP_DIR"

echo "上传文件到服务器..."
scp $SSH_OPTIONS deploy.tar.gz "$SERVER_USER@$SERVER_IP:$REMOTE_TEMP_DIR/"

echo "在服务器上解压文件..."
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "cd $REMOTE_TEMP_DIR && tar xzf deploy.tar.gz && rm deploy.tar.gz"

# 清理本地临时文件
cd "$PROJECT_ROOT"
rm -rf "$LOCAL_TEMP_DIR"

# 检查临时目录内容
echo "检查服务器临时目录内容..."
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "ls -la $REMOTE_TEMP_DIR/"
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "ls -la $REMOTE_TEMP_DIR/server/"

# 确保文件权限正确并移动到最终位置
echo "移动文件到最终位置..."
ssh $SSH_OPTIONS -t "$SERVER_USER@$SERVER_IP" "
    echo '备份现有文件...' && \
    sudo rm -rf /var/www/$APP_NAME.bak && \
    sudo mv /var/www/$APP_NAME /var/www/$APP_NAME.bak || true && \
    echo '创建新目录...' && \
    sudo mkdir -p /var/www/$APP_NAME && \
    echo '复制文件...' && \
    sudo cp -r $REMOTE_TEMP_DIR/* /var/www/$APP_NAME/ && \
    echo '设置权限...' && \
    sudo chown -R $SERVER_USER:$SERVER_USER /var/www/$APP_NAME && \
    echo '最终目录内容：' && \
    ls -la /var/www/$APP_NAME && \
    echo 'server 目录内容：' && \
    ls -la /var/www/$APP_NAME/server/ && \
    rm -rf $REMOTE_TEMP_DIR
"

echo "正在部署应用..."
ssh $SSH_OPTIONS -t "$SERVER_USER@$SERVER_IP" "export BING_SEARCH_API_KEY='$BING_SEARCH_API_KEY' \
    PLANT_ID_API_KEY='$PLANT_ID_API_KEY' \
    AZURE_OPENAI_ENDPOINT='$AZURE_OPENAI_ENDPOINT' \
    AZURE_OPENAI_KEY='$AZURE_OPENAI_KEY' \
    AZURE_OPENAI_DEPLOYMENT_ID='$AZURE_OPENAI_DEPLOYMENT_ID' \
    JWT_SECRET='$JWT_SECRET' && \
    chmod +x ~/deploy-app.sh && ~/deploy-app.sh"

echo "部署完成！"
