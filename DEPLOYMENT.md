# 部署到 Vercel 指南

## 前置准备

### 1. 准备 PostgreSQL 数据库

选择一个数据库服务商（推荐 Neon 或 Supabase）：

**Neon (推荐)**
1. 访问 https://neon.tech
2. 创建免费账号
3. 创建新项目
4. 复制连接字符串（格式：`postgresql://user:password@host/database`）

**Supabase**
1. 访问 https://supabase.com
2. 创建新项目
3. 在 Settings → Database 中找到连接字符串

### 2. 生成密钥

在终端运行以下命令生成密钥：

**AUTH_SECRET（认证密钥）**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**CRON_SECRET（定时任务密钥）**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 部署步骤

### 方式一：Vercel Dashboard（推荐新手）

1. **推送代码到 Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <你的仓库地址>
   git push -u origin main
   ```

2. **在 Vercel 部署**
   - 访问 https://vercel.com/new
   - 选择你的 Git 仓库
   - 配置环境变量：
     - `DATABASE_URL`: 你的数据库连接字符串
     - `AUTH_SECRET`: 生成的认证密钥
     - `CRON_SECRET`: 生成的定时任务密钥
   - 点击 Deploy

3. **初始化数据库**
   部署完成后，在 Vercel 项目设置中运行：
   ```bash
   pnpm prisma migrate deploy
   ```

### 方式二：Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   pnpm add -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

4. **设置环境变量**
   ```bash
   vercel env add DATABASE_URL
   vercel env add AUTH_SECRET
   vercel env add CRON_SECRET
   ```

5. **生产部署**
   ```bash
   vercel --prod
   ```

## 环境变量配置

在 Vercel Dashboard 的 Settings → Environment Variables 中添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `DATABASE_URL` | `postgres认证密钥ql://user:pass@host/db` | Production, Preview, Development |
| `CRON_SECRET` | 生成的 32+ 字符定时任务 | Production, Preview, Development |
| `AUTH_SECRET` | 生成的 32+ 字符密钥 | Production, Preview, Development |

## 数据库迁移

首次部署后需要运行迁移：

1. 在 Vercel Dashboard → Settings → Functions
2. 或使用 Vercel CLI：
   ```bash
   vercel env pull .env.local
   pnp

## 定时任务配置

本项目使用 Vercel Cron Jobs 实现定时任务（付款提醒、逾期提醒等）。

### 配置步骤

1. **确保 `vercel.json` 已配置**（项目已包含）
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/daily",
         "schedule": "0 9 * * *"
       },
       {
         "path": "/api/cron/monthly",
         "schedule": "0 0 1 * *"
       }
     ]
   }
   ```

2. **验证定时任务**
   - 部署后访问 Vercel Dashboard → Settings → Cron Jobs
   - 确认任务已自动注册

3. **手动测试定时任务**
   ```bash
   curl -X POST https://your-domain.vercel.app/api/cron/daily \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### 定时任务说明

- **每日任务** (`/api/cron/daily`): 每天 9:00 执行，发送付款提醒和逾期提醒
- **每月任务** (`/api/cron/monthly`): 每月 1 号执行，发送月度账单m prisma migrate deploy
   ```

## 常见问题

### 1. 构建失败：Prisma Client 未生成
确保 `package.json` 中有：
```json
"postinstall": "prisma generate"
```

### 2. 数据库连接失败
- 检查 `DATABASE_URL` 是否正确
- 确保数据库允许外部连接
- Neon/Supabase 需要添加 `?sslmode=require`

### 3. 首次访问需要设置密码
访问 `/setup` 路径完成初始设置

## 更新部署

推送代码到 Git 仓库，Vercel 会自动重新部署：
```bash
git add .
git commit -m "Update"
git push
```

## 本地测试生产构建

```bash
pnpm build
pnpm start
```
