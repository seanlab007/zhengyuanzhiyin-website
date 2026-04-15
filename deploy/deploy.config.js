/**
 * 部署配置文件
 * 用于部署到阿里云轻量应用服务器
 */

module.exports = {
  // 服务器配置
  server: {
    host: "47.95.118.78",
    port: 22,
    username: "root",
    // 密钥路径（需要在本地配置）
    privateKeyPath: process.env.DEPLOY_KEY_PATH || "~/.ssh/id_rsa",
  },

  // 应用配置
  app: {
    name: "zhengyuanzhiyin-app",
    port: 3000,
    // 生产环境端口（需要通过Nginx反向代理）
    productionPort: 80,
    httpsPort: 443,
  },

  // 部署路径
  paths: {
    // 远程服务器应用目录
    remote: "/opt/zhengyuanzhiyin-app",
    // 远程服务器日志目录
    logs: "/var/log/zhengyuanzhiyin-app",
    // 远程服务器备份目录
    backups: "/opt/backups/zhengyuanzhiyin-app",
  },

  // 数据库配置
  database: {
    // 从环境变量读取
    url: process.env.DATABASE_URL,
  },

  // SSL证书配置
  ssl: {
    // 证书路径（需要提前上传到服务器）
    certPath: "/etc/ssl/certs/zhengyuanzhiyin.com.crt",
    keyPath: "/etc/ssl/private/zhengyuanzhiyin.com.key",
    // 或使用Let's Encrypt自动申请
    useLetsEncrypt: false,
    domain: "www.zhengyuanzhiyin.com",
  },

  // 环境变量
  env: {
    NODE_ENV: "production",
    PORT: 3000,
    // 其他环境变量从.env.production读取
  },

  // PM2配置
  pm2: {
    name: "zhengyuanzhiyin-app",
    script: "dist/index.js",
    instances: 1,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
    },
    error_file: "/var/log/zhengyuanzhiyin-app/error.log",
    out_file: "/var/log/zhengyuanzhiyin-app/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  },

  // Nginx配置
  nginx: {
    serverName: "www.zhengyuanzhiyin.com",
    upstreamPort: 3000,
    configPath: "/etc/nginx/sites-available/zhengyuanzhiyin",
  },
};
