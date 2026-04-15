# 正缘指引 - 部署指南

本指南说明如何将正缘指引应用部署到阿里云轻量应用服务器。

## 前置条件

- 阿里云轻量应用服务器（华北2-北京，IP: 47.95.118.78）
- 服务器已安装：Node.js、pnpm、PM2、Nginx
- SSL证书已申请（www.zhengyuanzhiyin.com）
- 域名DNS已指向服务器IP

## 部署步骤

### 1. 服务器环境准备

#### 连接到服务器
```bash
ssh root@47.95.118.78
```

#### 安装必要软件
```bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js（推荐v18+）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# 安装pnpm
npm install -g pnpm

# 安装PM2
npm install -g pm2

# 安装Nginx
apt install -y nginx

# 安装MySQL客户端（数据库连接）
apt install -y mysql-client
```

#### 创建应用目录
```bash
mkdir -p /opt/zhengyuanzhiyin-app
mkdir -p /opt/backups/zhengyuanzhiyin-app
mkdir -p /var/log/zhengyuanzhiyin-app
chown -R root:root /opt/zhengyuanzhiyin-app
chmod -R 755 /opt/zhengyuanzhiyin-app
```

### 2. SSL证书配置

#### 使用已有证书
```bash
# 将证书文件上传到服务器
scp your_cert.crt root@47.95.118.78:/etc/ssl/certs/zhengyuanzhiyin.com.crt
scp your_key.key root@47.95.118.78:/etc/ssl/private/zhengyuanzhiyin.com.key

# 设置正确权限
chmod 644 /etc/ssl/certs/zhengyuanzhiyin.com.crt
chmod 600 /etc/ssl/private/zhengyuanzhiyin.com.key
```

#### 或使用Let's Encrypt（免费）
```bash
# 安装Certbot
apt install -y certbot python3-certbot-nginx

# 申请证书
certbot certonly --standalone -d www.zhengyuanzhiyin.com -d zhengyuanzhiyin.com

# 证书位置
# /etc/letsencrypt/live/www.zhengyuanzhiyin.com/fullchain.pem
# /etc/letsencrypt/live/www.zhengyuanzhiyin.com/privkey.pem
```

### 3. 数据库配置

#### 连接到远程MySQL数据库
```bash
# 测试连接
mysql -h your_db_host -u root -p -e "SELECT 1;"

# 创建数据库
mysql -h your_db_host -u root -p << EOF
CREATE DATABASE zhengyuanzhiyin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zhengyuan'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON zhengyuanzhiyin.* TO 'zhengyuan'@'%';
FLUSH PRIVILEGES;
EOF
```

### 4. 环境变量配置

```bash
# 在服务器上创建.env.production
cd /opt/zhengyuanzhiyin-app
cp .env.production.template .env.production
nano .env.production

# 填入以下关键配置
DATABASE_URL=mysql://zhengyuan:your_password@your_db_host:3306/zhengyuanzhiyin
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
PORT=3000
```

### 5. 部署应用

#### 本地执行部署脚本
```bash
# 在本地项目目录
cd /home/ubuntu/zhengyuanzhiyin-app
bash deploy/deploy.sh production
```

#### 或手动部署
```bash
# 1. 本地构建
pnpm install
pnpm run build

# 2. 上传到服务器
scp -r dist/ package.json pnpm-lock.yaml root@47.95.118.78:/opt/zhengyuanzhiyin-app/

# 3. 在服务器上安装依赖
ssh root@47.95.118.78 << 'EOF'
cd /opt/zhengyuanzhiyin-app
pnpm install --prod
EOF

# 4. 启动应用
ssh root@47.95.118.78 << 'EOF'
cd /opt/zhengyuanzhiyin-app
pm2 start dist/index.js --name zhengyuanzhiyin-app --env NODE_ENV=production
pm2 save
EOF
```

### 6. Nginx配置

```bash
# 上传Nginx配置文件
scp deploy/nginx.conf.template root@47.95.118.78:/etc/nginx/sites-available/zhengyuanzhiyin

# 在服务器上启用配置
ssh root@47.95.118.78 << 'EOF'
ln -sf /etc/nginx/sites-available/zhengyuanzhiyin /etc/nginx/sites-enabled/
nginx -t  # 测试配置
systemctl reload nginx
EOF
```

### 7. 数据库迁移

```bash
# 在服务器上运行迁移
ssh root@47.95.118.78 << 'EOF'
cd /opt/zhengyuanzhiyin-app
pnpm run db:push
EOF
```

### 8. 验证部署

```bash
# 检查应用状态
ssh root@47.95.118.78 "pm2 status"

# 检查日志
ssh root@47.95.118.78 "tail -f /var/log/zhengyuanzhiyin-app/out.log"

# 测试HTTP端点
curl http://47.95.118.78:3000/health

# 测试HTTPS
curl -k https://www.zhengyuanzhiyin.com

# 检查Nginx
ssh root@47.95.118.78 "systemctl status nginx"
```

## 常见问题

### 1. 502 Bad Gateway
- 检查Node.js应用是否运行：`pm2 status`
- 检查应用日志：`pm2 logs zhengyuanzhiyin-app`
- 检查Nginx配置：`nginx -t`

### 2. SSL证书错误
- 检查证书文件权限
- 验证证书有效期：`openssl x509 -in /etc/ssl/certs/zhengyuanzhiyin.com.crt -text -noout`
- 更新证书（Let's Encrypt）：`certbot renew`

### 3. 数据库连接失败
- 检查DATABASE_URL环境变量
- 测试数据库连接：`mysql -h host -u user -p`
- 检查防火墙规则

### 4. 性能问题
- 增加PM2实例数：修改deploy.config.js中的instances
- 启用Nginx缓存
- 优化数据库查询

## 回滚部署

```bash
# 查看备份
ssh root@47.95.118.78 "ls -la /opt/backups/zhengyuanzhiyin-app/"

# 恢复备份
ssh root@47.95.118.78 << 'EOF'
BACKUP_DIR="/opt/backups/zhengyuanzhiyin-app/backup-YYYYMMDD-HHMMSS"
cp -r $BACKUP_DIR/dist /opt/zhengyuanzhiyin-app/
pm2 restart zhengyuanzhiyin-app
EOF
```

## 监控和维护

### 日志查看
```bash
# 应用日志
pm2 logs zhengyuanzhiyin-app

# Nginx日志
tail -f /var/log/nginx/zhengyuanzhiyin-access.log
tail -f /var/log/nginx/zhengyuanzhiyin-error.log
```

### 自动备份
```bash
# 添加定时备份任务（crontab）
0 2 * * * /opt/zhengyuanzhiyin-app/deploy/backup.sh
```

### 自动更新
```bash
# 添加定时更新任务
0 3 * * 0 /opt/zhengyuanzhiyin-app/deploy/deploy.sh production
```

## 支持

如有问题，请检查：
1. 部署日志
2. 应用日志（PM2）
3. Nginx日志
4. 数据库连接

联系技术支持：support@zhengyuanzhiyin.com
