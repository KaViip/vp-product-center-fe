# Value Partners Product Center — 前端部署指南

## 一、環境要求

| 工具   | 版本要求                    | 推薦版本  |
|--------|---------------------------|----------|
| Node.js| `^20.19.0` 或 `^22.18.0` 或 `^24.0.0` | v20.19+  |
| pnpm   | `>=10.0.0`                | 10.32+   |
| Nginx  | 任意穩定版                  | 1.24+    |

> ⚠️ 必須使用 **pnpm**，不支持 npm / yarn。

## 二、後端地址配置

前端通過 **Nginx 反向代理** 轉發 API 請求到後端，前端本身不直接配置後端 IP/端口。

### 請求路徑映射

| 環境   | 前端 `.env` 文件           | `VITE_GLOB_API_URL` | Nginx 代理路徑  |
|--------|--------------------------|---------------------|----------------|
| 開發    | `.env.development`       | `/api`              | `/api/`        |
| 測試    | `.env.test`              | `/test-api`         | `/test-api/`   |
| 生產    | `.env.production`        | `/prod-api`         | `/prod-api/`   |

### 本地開發（Vite Dev Server 代理）

修改 `apps/web-antd/vite.config.ts` 中的 `target` 即可更改本地後端地址：

```typescript
server: {
  proxy: {
    '/api': {
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      target: 'http://localhost:8080', // ← 改這裡：後端實際地址
      ws: true,
    },
  },
},
```

### 測試/生產部署（Nginx 代理）

**不需要修改前端代碼**。所有 API 請求由 Nginx 轉發，見下方 Nginx 配置。

## 三、構建打包

### 3.1 安裝依賴

```bash
# 在專案根目錄執行
pnpm install
```

### 3.2 打包命令

```bash
# 生產環境打包
pnpm build:antd

# 測試環境打包
pnpm build:antd:test
```

### 3.3 產物位置

打包完成後，產物在：

```
apps/web-antd/dist/
```

如果 `.env.production` 中 `VITE_ARCHIVER=true`（默認開啟），還會自動生成 `dist.zip`。

## 四、Nginx 部署配置

### 4.1 完整 Nginx 配置示例

假設：
- 後端 API 地址：`http://10.1.9.110:8080`
- 前端靜態資源目錄：`/usr/share/nginx/html/product-center`
- 訪問域名：`product-center.valuepartners.com`（按實際修改）

```nginx
server {
    listen       80;
    server_name  product-center.valuepartners.com;

    # 前端靜態資源
    root   /usr/share/nginx/html/product-center;
    index  index.html;

    # gzip 壓縮（前端已構建 gzip 產物）
    gzip_static on;

    # API 反向代理 — 將 /prod-api/ 轉發到後端
    location /prod-api/ {
        proxy_pass http://10.1.9.110:8080/;   # ← 後端實際地址，注意結尾的 /
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 120s;
        proxy_send_timeout 60s;
    }

    # Vue Router history 模式 — 所有非靜態資源請求回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 靜態資源緩存（JS/CSS/圖片等帶 hash 的文件）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 禁止訪問隱藏文件
    location ~ /\. {
        deny all;
    }
}
```

### 4.2 關鍵說明

| 配置項 | 說明 |
|-------|------|
| `proxy_pass http://後端地址/` | 結尾的 `/` 很重要，會自動去掉 `/prod-api` 前綴 |
| `try_files $uri $uri/ /index.html` | Vue Router history 模式必須，否則刷新頁面 404 |
| `gzip_static on` | 前端已生成 `.gz` 文件，Nginx 直接使用無需實時壓縮 |

### 4.3 測試環境 Nginx 配置

測試環境使用 `/test-api` 前綴，只需改 `location` 匹配路徑：

```nginx
location /test-api/ {
    proxy_pass http://10.1.9.110:8080/;
    # ... 其餘同上
}
```

## 五、部署步驟

提供兩種部署方式，根據環境選擇：

| 方式 | 適用場景 | 優點 | 缺點 |
|------|---------|------|------|
| **A. Dev Server（推薦 UAT）** | 測試環境、快速驗證 | 簡單、與本地開發一致 | 佔用 Node 進程、性能略低 |
| **B. Build + Nginx（推薦生產）** | 正式生產環境 | 高性能、穩定、可緩存 | 需要 Nginx、多一步打包 |

---

### 方式 A：Dev Server 部署（推薦 UAT / 測試環境）

與本地 `pnpm dev` 完全一致，Vite Dev Server 自帶 API 代理，無需 Nginx。

#### A.1 配置後端地址

修改 `apps/web-antd/vite.config.ts` 中的 `target` 為後端實際地址：

```typescript
server: {
  proxy: {
    '/api': {
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      target: 'http://後端IP:後端端口',  // ← 改這裡
      ws: true,
    },
  },
},
```

#### A.2 首次部署

```bash
# 1. 克隆代碼
git clone https://github.com/KaViip/vp-product-center-fe.git
cd vp-product-center-fe

# 2. 安裝依賴
pnpm install

# 3. 後台啟動 dev server（端口默認 5666）
nohup pnpm dev:antd > dev.log 2>&1 &

# 4. 查看日誌確認啟動成功
tail -f dev.log
# 看到 "Local: http://localhost:5666/" 即表示成功
```

#### A.3 更新部署

```bash
# 1. 拉取最新代碼
cd vp-product-center-fe
git pull origin master

# 2. 安裝依賴（如有更新）
pnpm install

# 3. 重啟 dev server
# 找到進程並殺掉
kill $(lsof -t -i:5666)
# 重新後台啟動
nohup pnpm dev:antd > dev.log 2>&1 &
```

#### A.4 注意事項

- Dev server 啟動後監聽端口 `5666`（可在 `.env.development` 中通過 `VITE_PORT` 修改）
- 確保服務器防火牆開放該端口
- 如果需要域名訪問，可在前面加一層 Nginx 做簡單的反向代理：

```nginx
server {
    listen 80;
    server_name product-center-uat.valuepartners.com;
    location / {
        proxy_pass http://127.0.0.1:5666;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

### 方式 B：Build + Nginx 部署（推薦生產環境）

#### B.1 首次部署

```bash
# 1. 上傳代碼到伺服器（或 git clone）
git clone https://github.com/KaViip/vp-product-center-fe.git
cd vp-product-center-fe

# 2. 安裝依賴
pnpm install

# 3. 打包（生產環境）
pnpm build:antd

# 4. 部署產物到 Nginx 目錄
cp -r apps/web-antd/dist/* /usr/share/nginx/html/product-center/

# 5. 配置 Nginx（參考第四章配置）
# 將配置放入 /etc/nginx/conf.d/product-center.conf

# 6. 檢查並重載 Nginx
nginx -t && nginx -s reload
```

#### B.2 更新部署

```bash
# 1. 拉取最新代碼
cd vp-product-center-fe
git pull origin master

# 2. 安裝依賴（如有更新）
pnpm install

# 3. 重新打包
pnpm build:antd

# 4. 替換產物
rm -rf /usr/share/nginx/html/product-center/*
cp -r apps/web-antd/dist/* /usr/share/nginx/html/product-center/

# 5. 重載 Nginx（可選，一般不需要）
nginx -s reload
```

## 六、驗證部署

部署完成後，按以下步驟驗證：

1. **訪問首頁**：瀏覽器打開 `http://IP:5666/`（Dev Server）或 `http://域名/`（Nginx），應看到登入頁面
2. **登入測試**：使用系統賬號登入
3. **API 連通**：登入成功 → 菜單正常加載 → 說明 API 代理配置正確
4. **功能測試**：進入 Product Center → Product Team / Operational Team 頁面，確認列表數據正常

### 常見問題排查

| 問題 | 可能原因 | 解決方案 |
|------|---------|---------|
| 頁面白屏 | Nginx 未配置 `try_files` | 添加 `try_files $uri $uri/ /index.html;` |
| 登入 404 | `proxy_pass` 地址錯誤 | 檢查後端地址和端口是否正確 |
| API 502 | 後端未啟動或端口不通 | `curl http://後端地址/` 確認後端可達 |
| 刷新頁面 404 | Nginx 缺少 history 回退 | 確認 `location /` 中有 `try_files` |
| 登入後空白 | `VITE_GLOB_APP_CLIENT_ID` 不匹配 | 確認 `.env` 中的客戶端 ID 與後端一致 |

## 七、Docker 部署（可選）

提供三種 Docker 部署方式，根據實際情況選擇。

### 方式 1：前端獨立容器（推薦）

前端單獨一個容器，Nginx serve 靜態文件並代理 API 到後端。

**Dockerfile：**

```dockerfile
# Build stage
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-antd/package.json ./apps/web-antd/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build:antd

# Production stage
FROM nginx:alpine
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 方式 2：同容器 — 後端 serve 前端靜態文件

前端打包後，將 `dist/` 內的靜態文件放入後端項目的 `src/main/resources/static/` 目錄，Spring Boot 直接 serve。無需 Nginx。

```bash
# 在前端項目根目錄執行
pnpm build:antd

# 將產物複製到後端項目
cp -r apps/web-antd/dist/* 後端項目/src/main/resources/static/
```

後端需確保 Spring Boot 配置了靜態資源映射和 SPA 路由回退（所有未匹配路徑返回 `index.html`）。

### 方式 3：同容器 — Nginx + 後端雙進程

容器內同時跑 Nginx（前端）和 Java（後端），用 `supervisord` 管理進程。

**Dockerfile：**

```dockerfile
FROM node:20-alpine AS frontend-builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build:antd

# 最終運行鏡像（需要後端團隊補充 Java 構建步驟）
FROM openjdk:17-jdk-slim
RUN apt-get update && apt-get install -y nginx supervisor
COPY --from=frontend-builder /app/apps/web-antd/dist /usr/share/nginx/html
# COPY 後端 jar 和 nginx.conf、supervisord.conf 等
# ...
```

> 此方式需要後端團隊自行完善 Java 構建和進程管理配置。

---

*文檔生成時間：2026-05-08*
*對應前端版本：commit `28d0e6e` 及之後*
