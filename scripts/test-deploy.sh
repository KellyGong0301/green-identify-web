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

# 设置 SSH 密钥
SSH_KEY="$HOME/.ssh/azure_vm"
SSH_OPTIONS="-i $SSH_KEY -o StrictHostKeyChecking=no"

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

echo "测试 1: 检查本地目录结构"
echo "脚本目录: $SCRIPT_DIR"
echo "项目根目录: $PROJECT_ROOT"
ls -la "$PROJECT_ROOT"

echo "测试 2: 检查 SSH 连接"
if ! ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "echo '连接成功'"; then
    echo "错误：无法连接到服务器"
    exit 1
fi

echo "测试 3: 创建临时目录并测试文件传输"
# 创建一个本地临时目录用于测试
LOCAL_TEMP_DIR=$(mktemp -d)
echo "本地临时目录: $LOCAL_TEMP_DIR"

# 创建测试文件
echo "测试内容" > "$LOCAL_TEMP_DIR/test.txt"

# 在服务器上创建临时目录
REMOTE_TEMP_DIR=$(ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "mktemp -d")
echo "远程临时目录: $REMOTE_TEMP_DIR"

# 测试文件传输
echo "测试文件传输..."
if ! scp $SSH_OPTIONS "$LOCAL_TEMP_DIR/test.txt" "$SERVER_USER@$SERVER_IP:$REMOTE_TEMP_DIR/"; then
    echo "错误：文件传输失败"
    exit 1
fi

# 验证文件传输
echo "验证文件传输..."
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "cat $REMOTE_TEMP_DIR/test.txt"

echo "测试 4: 测试环境变量传递"
# 测试环境变量
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "echo \$PATH"

echo "测试 5: 检查必要的命令"
COMMANDS=("node" "npm" "git" "pm2" "mongod" "nginx")
for cmd in "${COMMANDS[@]}"; do
    echo "检查命令: $cmd"
    if ! ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "command -v $cmd"; then
        echo "错误：命令 $cmd 不存在"
        exit 1
    fi
done

echo "测试 6: 检查目标目录权限"
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "
    sudo mkdir -p /var/www/$APP_NAME && \
    sudo chown $SERVER_USER:$SERVER_USER /var/www/$APP_NAME && \
    touch /var/www/$APP_NAME/test.txt && \
    rm /var/www/$APP_NAME/test.txt
"

echo "测试 7: 测试 MongoDB 连接"
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "
    mongosh --eval 'db.runCommand({ ping: 1 })' || { echo '错误：MongoDB 连接失败'; exit 1; }
"

echo "测试 8: 测试 Node.js 版本和 npm"
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "
    node --version && \
    npm --version
"

echo "测试 9: 测试文件压缩和解压"
cd "$LOCAL_TEMP_DIR"
echo "创建测试文件..."
mkdir -p test/dir1/dir2
echo "test1" > test/file1.txt
echo "test2" > test/dir1/file2.txt
echo "test3" > test/dir1/dir2/file3.txt

echo "压缩文件..."
COPYFILE_DISABLE=1 tar --no-xattrs --no-mac-metadata -czf test.tar.gz test/
ls -la test.tar.gz

echo "上传并解压文件..."
scp $SSH_OPTIONS test.tar.gz "$SERVER_USER@$SERVER_IP:$REMOTE_TEMP_DIR/"
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "
    cd $REMOTE_TEMP_DIR && \
    tar xzf test.tar.gz && \
    find test/ -type f -exec cat {} \;
"

# 清理测试文件
echo "清理测试文件..."
rm -rf "$LOCAL_TEMP_DIR"
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "rm -rf $REMOTE_TEMP_DIR"

echo "所有测试完成！"
