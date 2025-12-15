# 租金跟踪系统

一个简洁实用的个人租金和水电费跟踪管理系统。

## 功能特性

- ✅ **简单密码保护** - 使用 bcrypt 加密的密码保护系统
- ✅ **租金设置管理** - 配置月租金、付款日、押金和各项单价
- ✅ **水电记录** - 记录每月用电量、冷水、热水使用量
- ✅ **自动计算** - 根据用量和单价自动计算费用
- ✅ **支付跟踪** - 标记记录的支付状态
- ✅ **倒计时提醒** - 显示距离付款日的剩余天数
- ✅ **数据可视化** - 费用趋势图和用量对比图（最近12个月）
- ✅ **响应式设计** - 适配桌面和移动设备

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Shadcn UI
- **数据库**: PostgreSQL (通过 Prisma ORM)
- **认证**: JWT (jose) + bcryptjs
- **图表**: Recharts
- **包管理器**: pnpm

## 快速开始

### 1. 准备 PostgreSQL 数据库

确保您已安装并运行 PostgreSQL 数据库。创建一个新数据库：

```sql
CREATE DATABASE rent_tracker;
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```env
# PostgreSQL 数据库连接字符串
# 格式：postgresql://用户名:密码@主机:端口/数据库名
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rent_tracker?schema=public"

# 认证密钥（至少 32 字符）
AUTH_SECRET="your-secret-key-change-this-in-production-min-32-chars"
```

**连接字符串说明**：
- `postgres:postgres` - 用户名:密码
- `localhost:5432` - 主机:端口
- `rent_tracker` - 数据库名
- `schema=public` - 数据库 schema

### 4. 初始化数据库

```bash
# 生成 Prisma Client
pnpm prisma generate

# 创建数据库表
pnpm prisma migrate dev --name init
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 首次使用

1. **首次访问** - 系统会自动跳转到设置页面
2. **设置密码** - 输入至少 6 位的密码
3. **配置租金信息** - 填写月租金、付款日、押金和各项单价
4. **完成设置** - 系统会自动登录并跳转到仪表盘

## 主要功能

### 仪表盘

- 显示付款倒计时
- 显示当月汇总（租金、水电费、总计）
- 费用趋势图（折线图，显示租金、水电费、总费用变化）
- 用量对比图（柱状图，显示电量、冷水、热水使用量）
- 显示最近 10 条记录
- 快速创建新记录

### 记录管理

- 查看所有记录
- 创建新记录（输入用量，自动计算费用）
- 编辑现有记录
- 删除记录
- 切换支付状态

### 设置

- 修改租金配置
- 修改水电费单价
- 修改登录密码

## 项目结构

```
rent-tracker/
├── app/
│   ├── (dashboard)/          # 仪表盘路由组
│   │   ├── page.tsx          # 首页
│   │   ├── records/          # 记录管理
│   │   └── settings/         # 设置页面
│   ├── actions/              # Server Actions
│   │   ├── auth.ts           # 认证操作
│   │   ├── settings.ts       # 设置操作
│   │   └── records.ts        # 记录操作
│   ├── login/                # 登录页面
│   ├── setup/                # 首次设置页面
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/
│   ├── ui/                   # Shadcn UI 组件
│   ├── dashboard/            # 仪表盘组件
│   └── layout/               # 布局组件
├── lib/
│   ├── prisma.ts             # Prisma 客户端
│   ├── session.ts            # 会话管理
│   ├── calculations.ts       # 费用计算
│   ├── date-utils.ts         # 日期工具
│   └── utils.ts              # 通用工具
├── prisma/
│   └── schema.prisma         # 数据模型
├── middleware.ts             # 路由保护
└── package.json
```

## 数据模型

### SystemConfig（系统配置）
- 密码（加密存储）
- 初始化状态

### Settings（租金设置）
- 月租金
- 付款日（1-31）
- 押金
- 电费单价
- 冷水单价
- 热水单价

### Record（租金记录）
- 年月（YYYY-MM）
- 用电量、用电成本
- 冷水用量、冷水成本
- 热水用量、热水成本
- 总金额
- 是否已支付
- 备注

## 安全特性

- ✅ 密码使用 bcrypt 加密（成本因子 10）
- ✅ 会话使用 JWT 令牌（HttpOnly Cookie）
- ✅ 会话有效期 7 天
- ✅ 路由保护中间件
- ✅ Server Actions 验证
- ✅ Prisma 自动防止 SQL 注入

## 开发命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# Prisma 相关
pnpm prisma generate      # 生成 Prisma Client
pnpm prisma migrate dev   # 创建迁移
pnpm prisma studio        # 打开数据库管理界面
```

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量：
   - `DATABASE_URL`
   - `AUTH_SECRET`
4. 部署

### 自托管部署

```bash
# 构建
pnpm build

# 运行迁移
pnpm prisma migrate deploy

# 启动
pnpm start
```

## 许可证

MIT

## 作者

Claude Code - Anthropic
