# 租金跟踪系统 - 代码库文档

## 📋 项目概述

这是一个个人租金和水电费跟踪管理系统，使用 Next.js 14 构建，支持记录每月租金、用电量、冷水和热水使用量，并自动计算费用。

**技术栈**：
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + Shadcn UI
- PostgreSQL + Prisma ORM
- JWT 会话管理 (jose)
- bcryptjs 密码加密
- Recharts 图表库

## 🚀 快速开始

### 前置要求
- Node.js 18+
- pnpm 包管理器
- PostgreSQL 数据库

### 安装和运行

```powershell
# 1. 安装依赖
pnpm install

# 2. 配置环境变量（复制 .env.example 为 .env 并修改）
# DATABASE_URL="postgresql://用户名:密码@localhost:5432/rent_tracker?schema=public"
# AUTH_SECRET="至少32字符的随机密钥"

# 3. 生成 Prisma Client
pnpm prisma generate

# 4. 创建数据库表
pnpm prisma migrate dev --name init

# 5. 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

### 首次使用流程
1. 首次访问会自动跳转到 `/setup` 设置页面
2. 设置登录密码（至少 6 位）
3. 配置租金信息（月租金、付款日、押金、水电单价）
4. 完成后自动登录并跳转到仪表盘

## 🏗️ 架构设计

### 路由结构

```
app/
├── (dashboard)/          # 认证后的路由组
│   ├── layout.tsx        # 检查初始化状态，包含导航栏
│   ├── page.tsx          # 仪表盘首页
│   ├── records/          # 记录管理
│   │   ├── page.tsx      # 记录列表
│   │   ├── new/          # 新建记录
│   │   └── [id]/edit/    # 编辑记录
│   └── settings/         # 设置页面
├── login/                # 登录页面
├── setup/                # 首次设置页面
└── layout.tsx            # 根布局
```

**关键设计决策**：
- 使用路由组 `(dashboard)` 和 `(auth)` 组织页面
- 初始化检查从 middleware 移到 `(dashboard)/layout.tsx`（避免 Edge Runtime 限制）
- 使用 Server Actions 处理所有数据操作

### 数据模型

**prisma/schema.prisma**

```prisma
model SystemConfig {
  id        Int      @id @default(1)  // 单例模式
  password  String                     // bcrypt 加密
  isSetup   Boolean  @default(false)  // 是否完成初始设置
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Settings {
  id              Int      @id @default(1)  // 单例模式
  monthlyRent     Float                      // 月租金
  paymentDay      Int                        // 付款日（1-31）
  deposit         Float                      // 押金
  electricityRate Float                      // 电费单价（元/度）
  coldWaterRate   Float                      // 冷水单价（元/吨）
  hotWaterRate    Float                      // 热水单价（元/吨）
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Record {
  id               Int      @id @default(autoincrement())
  yearMonth        String   @unique                    // YYYY-MM 格式
  electricityUsage Float                               // 用电量（度）
  electricityCost  Float                               // 电费
  coldWaterUsage   Float                               // 冷水用量（吨）
  coldWaterCost    Float                               // 冷水费
  hotWaterUsage    Float                               // 热水用量（吨）
  hotWaterCost     Float                               // 热水费
  totalAmount      Float                               // 总金额（含租金）
  isPaid           Boolean  @default(false)            // 是否已支付
  notes            String?                             // 备注
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### 核心工具库

**lib/session.ts** - JWT 会话管理
```typescript
// 使用 jose 库生成 JWT
// 会话存储在 HttpOnly Cookie 中
// 有效期 7 天
export async function createSession()
export async function verifySession()
export async function deleteSession()
```

**lib/calculations.ts** - 费用计算
```typescript
// 根据用量和单价自动计算各项费用
export function calculateCosts(
  electricityUsage: number,
  coldWaterUsage: number,
  hotWaterUsage: number,
  settings: Settings
)
```

**lib/date-utils.ts** - 日期工具
```typescript
// 计算距离付款日的剩余天数
export function calculateDaysUntilPayment(paymentDay: number)
// 格式化年月字符串
export function formatYearMonth(date: Date)
```

### Server Actions

**app/actions/auth.ts**
- `checkSetupStatus()` - 检查是否完成初始设置
- `setupSystem()` - 首次设置（密码 + 租金配置）
- `login()` - 用户登录
- `logout()` - 用户登出
- `changePassword()` - 修改密码

**app/actions/settings.ts**
- `getSettings()` - 获取租金设置
- `updateSettings()` - 更新租金设置

**app/actions/records.ts**
- `getRecords()` - 获取所有记录
- `getCurrentMonthRecord()` - 获取当月记录
- `createRecord()` - 创建新记录
- `updateRecord()` - 更新记录
- `deleteRecord()` - 删除记录
- `togglePaidStatus()` - 切换支付状态

### 中间件和路由保护

**middleware.ts**
```typescript
// ⚠️ 重要：不能在 middleware 中使用 Prisma（Edge Runtime 限制）
// 只验证会话，不查询数据库
export async function middleware(request: NextRequest) {
  const publicRoutes = ["/login", "/setup"];

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

**app/(dashboard)/layout.tsx**
```typescript
// 初始化检查在这里进行（可以使用 Prisma）
export default async function DashboardLayout({ children }) {
  const { isSetup } = await checkSetupStatus();
  if (!isSetup) {
    redirect("/setup");
  }
  return <div>{children}</div>;
}
```

## 🔒 安全措施

1. **密码安全**
   - 使用 bcrypt 加密（成本因子 10）
   - 最小长度 6 位
   - 不在客户端存储明文

2. **会话安全**
   - JWT 令牌存储在 HttpOnly Cookie 中
   - 7 天过期时间
   - 生产环境使用 Secure 标志

3. **输入验证**
   - 所有表单使用 Zod 验证
   - Server Actions 中二次验证
   - Prisma 自动防止 SQL 注入

4. **路由保护**
   - middleware.ts 验证会话
   - layout.tsx 检查初始化状态
   - 未认证用户重定向到登录页

## 🐛 常见问题和解决方案

### 问题 1: "PrismaClient is not configured to run in Edge Runtime"

**原因**：在 middleware.ts 中使用了 Prisma 客户端

**解决方案**：
- middleware 只用于会话验证，不查询数据库
- 数据库查询移到 layout.tsx 或 Server Actions 中

### 问题 2: 界面卡在"正在初始化..."

**原因**：存在多个 page.tsx 文件（app/page.tsx 和 app/(dashboard)/page.tsx）

**解决方案**：
- 删除 app/page.tsx
- 确保只有 app/(dashboard)/page.tsx 作为首页
- 在 setup 页面使用 `window.location.href = "/"` 强制刷新

### 问题 3: Module Not Found (tailwind-merge)

**原因**：构建缓存损坏

**解决方案**：
```powershell
# 停止开发服务器
# 删除缓存
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache

# 重新安装
pnpm install
pnpm prisma generate

# 重启服务器
pnpm dev
```

### 问题 4: 数据库连接失败

**检查清单**：
1. PostgreSQL 服务是否运行
2. .env 中的 DATABASE_URL 是否正确
3. 数据库是否已创建（`CREATE DATABASE rent_tracker;`）
4. 用户名和密码是否正确
5. 是否执行了 `pnpm prisma migrate dev`

## 📁 关键文件说明

### 配置文件
- `.env` - 环境变量（数据库连接、认证密钥）
- `prisma/schema.prisma` - 数据库模型定义
- `middleware.ts` - 路由保护（仅会话验证）
- `tailwind.config.ts` - Tailwind CSS 配置
- `components.json` - Shadcn UI 配置

### 核心逻辑
- `lib/prisma.ts` - Prisma 客户端单例
- `lib/session.ts` - JWT 会话管理
- `lib/calculations.ts` - 费用计算逻辑
- `lib/date-utils.ts` - 日期处理工具

### Server Actions
- `app/actions/auth.ts` - 认证相关操作
- `app/actions/settings.ts` - 设置相关操作
- `app/actions/records.ts` - 记录相关操作

### UI 组件
- `components/ui/` - Shadcn UI 基础组件
- `components/dashboard/` - 仪表盘专用组件
  - `cost-trend-chart.tsx` - 费用趋势图（折线图）
  - `usage-comparison-chart.tsx` - 用量对比图（柱状图）
  - `countdown-card.tsx` - 付款倒计时卡片
  - `summary-cards.tsx` - 汇总卡片
  - `records-table.tsx` - 记录表格
- `components/layout/` - 布局组件（导航栏等）

## 🛠️ 开发命令

```powershell
# 开发
pnpm dev                    # 启动开发服务器（http://localhost:3000）

# 构建
pnpm build                  # 生产构建
pnpm start                  # 启动生产服务器

# 代码质量
pnpm lint                   # ESLint 检查

# 数据库
pnpm prisma generate        # 生成 Prisma Client
pnpm prisma migrate dev     # 创建迁移
pnpm prisma studio          # 打开数据库管理界面
pnpm prisma db push         # 推送 schema 到数据库（不创建迁移）

# 调试
node check-db.js            # 检查数据库状态（自定义脚本）
```

## 📊 数据流程

### 首次设置流程
```
用户访问 → middleware 检查会话 → 无会话重定向到 /login
→ layout 检查 isSetup → false 重定向到 /setup
→ 用户填写密码和租金信息 → setupSystem() Server Action
→ 保存 SystemConfig (password, isSetup=true)
→ 保存 Settings (租金配置)
→ 创建会话 → 重定向到首页
```

### 登录流程
```
用户访问 /login → 输入密码 → login() Server Action
→ 验证密码（bcrypt.compare）→ 创建会话 → 重定向到首页
```

### 创建记录流程
```
用户填写用量 → createRecord() Server Action
→ 调用 calculateCosts() 计算费用
→ 保存到 Record 表 → 返回成功 → 刷新页面
```

## 📊 数据可视化功能

### 费用趋势图 (CostTrendChart)
**文件**：`components/dashboard/cost-trend-chart.tsx`

**功能**：
- 使用 Recharts 折线图展示最近 12 个月的费用变化
- 三条折线：租金（蓝色）、水电费（橙色）、总费用（绿色）
- 自定义 Tooltip 显示详细金额
- 响应式设计，自适应容器宽度

**数据处理**：
```typescript
// 将记录转换为图表数据格式
const chartData = records.slice(0, 12).reverse().map((record) => ({
  month: record.yearMonth,
  租金: monthlyRent,
  水电费: electricityCost + coldWaterCost + hotWaterCost,
  总费用: record.totalAmount,
}));
```

### 用量对比图 (UsageComparisonChart)
**文件**：`components/dashboard/usage-comparison-chart.tsx`

**功能**：
- 使用 Recharts 柱状图展示最近 12 个月的用量对比
- 三组柱状：电量（蓝色）、冷水（青色）、热水（橙色）
- 自定义 Tooltip 显示单位（度/吨）
- 圆角柱状图设计

**数据处理**：
```typescript
// 将记录转换为图表数据格式
const chartData = records.slice(0, 12).reverse().map((record) => ({
  month: record.yearMonth,
  电量: record.electricityUsage,
  冷水: record.coldWaterUsage,
  热水: record.hotWaterUsage,
}));
```

### 集成方式
在仪表盘页面 (`app/(dashboard)/page.tsx`) 中：
```typescript
{allRecords.length > 0 && (
  <div className="grid gap-6 md:grid-cols-2">
    <CostTrendChart records={allRecords} monthlyRent={settings.monthlyRent} />
    <UsageComparisonChart records={allRecords} />
  </div>
)}
```

**显示条件**：
- 只有当存在记录数据时才显示图表
- 使用响应式网格布局（桌面端并排，移动端堆叠）

## 🎨 UI 设计规范

### 颜色方案
- **主色**：蓝色（信息展示）
- **成功色**：绿色（已支付）
- **警告色**：黄色（即将到期）
- **危险色**：红色（逾期）
- **中性色**：灰色（未支付）

### 响应式断点
- **移动端**：< 640px
- **平板**：640px - 1024px
- **桌面**：> 1024px

## 🔄 扩展方向

1. **数据可视化** ✅ 已完成
   - ✅ 使用 Recharts 添加月度费用趋势图
   - ✅ 水电使用量对比图

2. **导出功能**
   - 导出为 PDF 账单
   - 导出为 Excel 报表

3. **提醒功能**
   - 邮件提醒（付款日前 3 天）
   - 浏览器通知 API

4. **多用户支持**
   - 用户注册/登录系统
   - 每个用户独立数据

## 📝 代码规范

- 所有注释使用中文
- 组件名使用 PascalCase
- 文件名使用 kebab-case
- Server Actions 使用 "use server" 指令
- 客户端组件使用 "use client" 指令
- 类型定义优先使用 TypeScript 内置类型

## 🚀 部署

### Vercel 部署
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（DATABASE_URL, AUTH_SECRET）
4. 部署

### 自托管部署
```powershell
# 构建
pnpm build

# 运行迁移
pnpm prisma migrate deploy

# 启动
pnpm start
```

## 📞 技术支持

- Next.js 文档: https://nextjs.org/docs
- Prisma 文档: https://www.prisma.io/docs
- Shadcn UI: https://ui.shadcn.com

---

**最后更新**: 2025-12-15
**当前版本**: 1.0.0
