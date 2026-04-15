#!/bin/bash

# 部署脚本 - 用于部署到阿里云轻量应用服务器
# 使用方法: bash deploy.sh [production|staging]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
DEPLOY_ENV=${1:-production}
SERVER_IP="47.95.118.78"
SERVER_USER="root"
REMOTE_PATH="/opt/zhengyuanzhiyin-app"
LOCAL_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}正缘指引 - 部署脚本${NC}"
echo -e "${YELLOW}环境: $DEPLOY_ENV${NC}"
echo -e "${YELLOW}服务器: $SERVER_IP${NC}"
echo -e "${YELLOW}========================================${NC}"

# 1. 本地构建
echo -e "\n${YELLOW}[1/5] 本地构建...${NC}"
cd "$LOCAL_PATH"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}安装依赖...${NC}"
    pnpm install
fi

# 构建前端
echo -e "${YELLOW}构建前端...${NC}"
pnpm run build

# 构建后端
echo -e "${YELLOW}构建后端...${NC}"
pnpm run build

if [ ! -f "dist/index.js" ]; then
    echo -e "${RED}构建失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 本地构建完成${NC}"

# 2. 创建部署包
echo -e "\n${YELLOW}[2/5] 创建部署包...${NC}"
DEPLOY_PACKAGE="zhengyuanzhiyin-app-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$DEPLOY_PACKAGE" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.env \
    --exclude=dist \
    dist/ \
    client/dist/ \
    package.json \
    pnpm-lock.yaml \
    drizzle/ \
    deploy/

echo -e "${GREEN}✓ 部署包创建完成: $DEPLOY_PACKAGE${NC}"

# 3. 上传到服务器
echo -e "\n${YELLOW}[3/5] 上传到服务器...${NC}"
scp -r "$DEPLOY_PACKAGE" "$SERVER_USER@$SERVER_IP:/tmp/"
echo -e "${GREEN}✓ 上传完成${NC}"

# 4. 在服务器上执行部署
echo -e "\n${YELLOW}[4/5] 在服务器上执行部署...${NC}"
ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
set -e

DEPLOY_PACKAGE=$(ls -t /tmp/zhengyuanzhiyin-app-*.tar.gz | head -1)
REMOTE_PATH="/opt/zhengyuanzhiyin-app"

echo "解压部署包..."
mkdir -p "$REMOTE_PATH"
cd "$REMOTE_PATH"

# 备份当前版本
if [ -d "dist" ]; then
    BACKUP_DIR="/opt/backups/zhengyuanzhiyin-app/backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r dist "$BACKUP_DIR/"
    echo "✓ 备份完成: $BACKUP_DIR"
fi

# 解压新版本
tar -xzf "$DEPLOY_PACKAGE"
rm "$DEPLOY_PACKAGE"

# 安装依赖
echo "安装依赖..."
pnpm install --prod

# 停止旧进程
echo "停止旧进程..."
pm2 stop zhengyuanzhiyin-app || true
pm2 delete zhengyuanzhiyin-app || true

# 启动新进程
echo "启动新进程..."
pm2 start dist/index.js --name zhengyuanzhiyin-app --env NODE_ENV=production
pm2 save

# 重新加载Nginx
echo "重新加载Nginx..."
systemctl reload nginx

echo "✓ 部署完成！"
EOF

echo -e "${GREEN}✓ 服务器部署完成${NC}"

# 5. 验证部署
echo -e "\n${YELLOW}[5/5] 验证部署...${NC}"
sleep 2

# 检查应用是否运行
if curl -s http://$SERVER_IP:3000/health > /dev/null; then
    echo -e "${GREEN}✓ 应用运行正常${NC}"
else
    echo -e "${RED}✗ 应用运行异常，请检查日志${NC}"
    exit 1
fi

# 检查HTTPS
if curl -s -k https://www.zhengyuanzhiyin.com > /dev/null; then
    echo -e "${GREEN}✓ HTTPS连接正常${NC}"
else
    echo -e "${YELLOW}⚠ HTTPS连接异常，请检查DNS和SSL证书${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}部署成功！${NC}"
echo -e "${GREEN}应用地址: https://www.zhengyuanzhiyin.com${NC}"
echo -e "${GREEN}========================================${NC}"

# 清理本地部署包
rm -f "$DEPLOY_PACKAGE"
