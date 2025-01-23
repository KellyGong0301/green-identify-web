#!/bin/bash

# 检查配置文件是否存在
CONFIG_FILE="deploy-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "错误：找不到配置文件 $CONFIG_FILE"
    echo "请先复制 deploy-config.example.json 到 deploy-config.json 并填写配置信息"
    exit 1
fi

# 读取配置
SERVER_IP=$(jq -r '.server.ip' "$CONFIG_FILE")
SERVER_USER=$(jq -r '.server.user' "$CONFIG_FILE")
SERVER_DOMAIN=$(jq -r '.server.domain' "$CONFIG_FILE")
APP_NAME=$(jq -r '.app.name' "$CONFIG_FILE")
APP_PORT=$(jq -r '.app.port' "$CONFIG_FILE")

# 读取环境变量
BING_SEARCH_API_KEY=$(jq -r '.env.BING_SEARCH_API_KEY' "$CONFIG_FILE")
PLANT_ID_API_KEY=$(jq -r '.env.PLANT_ID_API_KEY' "$CONFIG_FILE")
AZURE_OPENAI_ENDPOINT=$(jq -r '.env.AZURE_OPENAI_ENDPOINT' "$CONFIG_FILE")
AZURE_OPENAI_KEY=$(jq -r '.env.AZURE_OPENAI_KEY' "$CONFIG_FILE")
AZURE_OPENAI_DEPLOYMENT_ID=$(jq -r '.env.AZURE_OPENAI_DEPLOYMENT_ID' "$CONFIG_FILE")
JWT_SECRET=$(jq -r '.env.JWT_SECRET' "$CONFIG_FILE")

# 验证必要的配置
if [ "$SERVER_IP" == "YOUR_VM_IP" ] || [ "$SERVER_USER" == "YOUR_SSH_USER" ]; then
    echo "错误：请先在 $CONFIG_FILE 中填写正确的服务器配置"
    exit 1
fi

# 导出环境变量，这样它们就可以在远程脚本中使用
export BING_SEARCH_API_KEY
export PLANT_ID_API_KEY
export AZURE_OPENAI_ENDPOINT
export AZURE_OPENAI_KEY
export AZURE_OPENAI_DEPLOYMENT_ID
export JWT_SECRET

# 复制部署脚本到服务器
echo "正在复制部署脚本到服务器..."
scp -o StrictHostKeyChecking=no deploy-setup.sh deploy-app.sh "$SERVER_USER@$SERVER_IP:/tmp/"

# 执行环境设置脚本
echo "正在设置服务器环境..."
ssh -t -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "sudo bash /tmp/deploy-setup.sh"

# 部署应用
echo "正在部署应用..."
ssh -t -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "sudo bash /tmp/deploy-app.sh"

echo "部署完成！"
