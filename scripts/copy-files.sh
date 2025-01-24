#!/bin/bash

# 启用错误检查和调试输出
set -e
set -x

# SSH 配置
SSH_KEY="$HOME/.ssh/azure_vm"
SERVER_USER="kellygong"
SERVER_IP="74.235.243.123"
SSH_OPTIONS="-i $SSH_KEY -o StrictHostKeyChecking=no"

# 获取项目根目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

echo "项目根目录: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# 1. 先检查本地文件
echo "本地文件列表："
ls -la

# 2. 在服务器上准备目录
REMOTE_DIR="/var/www/green-identify"
echo "准备远程目录..."
echo "请输入服务器的 sudo 密码："
read -s SUDO_PASS

echo "备份和创建目录..."
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "
    # 备份旧目录
    if [ -d \"$REMOTE_DIR\" ]; then
        echo \"$SUDO_PASS\" | sudo -S mv \"$REMOTE_DIR\" \"${REMOTE_DIR}_backup_\$(date +%Y%m%d_%H%M%S)\"
    fi

    # 创建新目录
    echo \"$SUDO_PASS\" | sudo -S mkdir -p \"$REMOTE_DIR\"
    echo \"$SUDO_PASS\" | sudo -S chown -R \"$SERVER_USER:$SERVER_USER\" \"$REMOTE_DIR\"
" 2>/dev/null

# 3. 复制文件到服务器
echo "复制文件到服务器..."
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.DS_Store' \
    --exclude '*.swp' \
    -e "ssh $SSH_OPTIONS" \
    ./* "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

# 4. 检查服务器上的文件
echo "服务器上的文件列表："
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "
    echo '根目录:' && ls -la \"$REMOTE_DIR\"/ && 
    echo '\nserver 目录:' && ls -la \"$REMOTE_DIR\"/server/ && 
    echo '\nsrc 目录:' && ls -la \"$REMOTE_DIR\"/src/ && 
    echo '\nscripts 目录:' && ls -la \"$REMOTE_DIR\"/scripts/"
"

echo "文件复制完成！"
