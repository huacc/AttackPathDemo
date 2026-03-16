# 攻击路径推演系统 - 部署指南

## 📋 目录

1. [系统要求](#系统要求)
2. [开发环境部署](#开发环境部署)
3. [生产环境部署](#生产环境部署)
4. [Docker部署](#docker部署)
5. [Nginx配置](#nginx配置)
6. [故障排查](#故障排查)

---

## 系统要求

### 软件要求
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **浏览器**: Chrome/Firefox/Safari/Edge (最新版本)

### 硬件要求
- **CPU**: 2核心以上
- **内存**: 4GB以上
- **磁盘**: 500MB可用空间

### 网络要求
- **开发环境**: 需要互联网连接（npm install）
- **生产环境**: 完全离线可用 ✅

---

## 开发环境部署

### 1. 克隆代码

```bash
cd /home/dhc/AttackPath/demo
```

### 2. 安装依赖

```bash
npm install
```

**预计时间**: 2-5分钟（取决于网络速度）

### 3. 启动开发服务器

```bash
npm run dev
```

**访问地址**:
- 本地: http://localhost:3009
- 外部: http://YOUR_IP:3009

### 4. 验证部署

打开浏览器访问 http://localhost:3009，应该看到系统首页。

---

## 生产环境部署

### 方式一：静态文件部署

#### 1. 构建生产版本

```bash
npm run build
```

**输出目录**: `dist/`  
**构建时间**: 约30-60秒

#### 2. 验证构建产物

```bash
ls -lh dist/
```

应该看到：
- index.html
- assets/ (CSS、JS、图片等)

#### 3. 部署到Web服务器

将 `dist/` 目录的所有文件复制到Web服务器根目录。

**支持的Web服务器**:
- Nginx (推荐)
- Apache
- IIS
- Caddy

---

### 方式二：使用预览服务器

```bash
npm run preview
```

**访问地址**: http://localhost:4173

**注意**: 仅用于预览，不建议用于生产环境。

---

## Docker部署

### 1. 创建Dockerfile

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. 构建Docker镜像

```bash
docker build -t attack-path-system:1.0.0 .
```

### 3. 运行容器

```bash
docker run -d \
  --name attack-path \
  -p 80:80 \
  attack-path-system:1.0.0
```

### 4. 访问系统

http://localhost

---

## Nginx配置

### 基础配置

创建 `/etc/nginx/conf.d/attack-path.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/attack-path/dist;
    index index.html;

    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### HTTPS配置

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    root /var/www/attack-path/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 重启Nginx

```bash
# 测试配置
sudo nginx -t

# 重启服务
sudo systemctl restart nginx
```

---

## Apache配置

### .htaccess配置

在 `dist/` 目录创建 `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# 启用gzip压缩
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# 缓存控制
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 环境变量配置

### 开发环境

创建 `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=攻击路径推演系统（开发）
```

### 生产环境

创建 `.env.production`:

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_TITLE=攻击路径推演系统
```

---

## 故障排查

### 问题1：页面空白

**原因**: 路由配置问题

**解决方案**:
1. 检查Web服务器配置是否支持SPA路由
2. 确保所有路由都指向 `index.html`

### 问题2：静态资源404

**原因**: 资源路径错误

**解决方案**:
1. 检查 `vite.config.ts` 中的 `base` 配置
2. 确保资源路径正确

### 问题3：构建失败

**原因**: 依赖问题或内存不足

**解决方案**:
```bash
# 清理缓存
rm -rf node_modules package-lock.json
npm install

# 增加Node内存
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### 问题4：端口被占用

**原因**: 端口3009已被使用

**解决方案**:
```bash
# 查找占用端口的进程
lsof -ti:3009

# 杀死进程
kill -9 $(lsof -ti:3009)

# 或修改端口
# 编辑 vite.config.ts，修改 server.port
```

---

## 性能优化

### 1. 启用CDN（可选）

如果需要使用CDN加速：

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    # 添加CDN配置
}
```

### 2. 启用HTTP/2

```nginx
listen 443 ssl http2;
```

### 3. 启用Brotli压缩

```nginx
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml;
```

---

## 监控和日志

### Nginx访问日志

```bash
tail -f /var/log/nginx/access.log
```

### Nginx错误日志

```bash
tail -f /var/log/nginx/error.log
```

### 系统监控

```bash
# CPU和内存使用
htop

# 磁盘使用
df -h

# 网络连接
netstat -tulpn | grep :80
```

---

## 备份和恢复

### 备份

```bash
# 备份代码
tar -czf attack-path-backup-$(date +%Y%m%d).tar.gz /var/www/attack-path/

# 备份配置
cp /etc/nginx/conf.d/attack-path.conf /backup/
```

### 恢复

```bash
# 恢复代码
tar -xzf attack-path-backup-20260316.tar.gz -C /var/www/

# 恢复配置
cp /backup/attack-path.conf /etc/nginx/conf.d/
sudo systemctl restart nginx
```

---

## 安全建议

1. ✅ 使用HTTPS
2. ✅ 配置安全头（X-Frame-Options、CSP等）
3. ✅ 定期更新依赖
4. ✅ 限制访问IP（如果是内网系统）
5. ✅ 启用防火墙
6. ✅ 定期备份

---

## 联系支持

如有问题，请联系技术支持团队。

**部署状态**: ✅ 生产就绪
