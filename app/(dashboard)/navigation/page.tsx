import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Mail,
  PlusCircle,
  CreditCard,
  BarChart3,
  Download,
  Bell,
  Shield,
  Calendar,
} from "lucide-react";

// 功能模块数据
const modules = [
  {
    category: "核心功能",
    items: [
      {
        title: "仪表盘",
        description: "查看概览、统计数据和图表分析",
        href: "/",
        icon: LayoutDashboard,
        color: "bg-blue-500",
      },
      {
        title: "记录管理",
        description: "查看、创建和管理月度租金记录",
        href: "/records",
        icon: FileText,
        color: "bg-green-500",
      },
      {
        title: "新建记录",
        description: "快速创建新的月度记录",
        href: "/records/new",
        icon: PlusCircle,
        color: "bg-purple-500",
      },
    ],
  },
  {
    category: "数据分析",
    items: [
      {
        title: "费用趋势",
        description: "查看最近12个月的费用变化趋势",
        href: "/#trends",
        icon: BarChart3,
        color: "bg-orange-500",
      },
      {
        title: "用量对比",
        description: "对比各月的水电使用量",
        href: "/#usage",
        icon: Calendar,
        color: "bg-cyan-500",
      },
      {
        title: "数据导出",
        description: "导出记录为 Excel 文件",
        href: "/records",
        icon: Download,
        color: "bg-indigo-500",
      },
    ],
  },
  {
    category: "设置与配置",
    items: [
      {
        title: "基础设置",
        description: "配置租金、付款日和水电单价",
        href: "/settings",
        icon: Settings,
        color: "bg-gray-500",
      },
      {
        title: "邮件设置",
        description: "配置 SMTP 服务器和通知规则",
        href: "/settings/email",
        icon: Mail,
        color: "bg-red-500",
      },
      {
        title: "邮件历史",
        description: "查看已发送的邮件记录",
        href: "/email",
        icon: Bell,
        color: "bg-yellow-500",
      },
    ],
  },
  {
    category: "账户安全",
    items: [
      {
        title: "修改密码",
        description: "更改登录密码",
        href: "/settings",
        icon: Shield,
        color: "bg-pink-500",
      },
      {
        title: "支付管理",
        description: "管理记录的支付状态",
        href: "/records",
        icon: CreditCard,
        color: "bg-emerald-500",
      },
    ],
  },
];

// 快捷操作
const quickActions = [
  {
    title: "创建本月记录",
    description: "为本月创建新的租金记录",
    href: "/records/new",
    badge: "快捷",
  },
  {
    title: "查看未支付",
    description: "查看所有未支付的记录",
    href: "/records",
    badge: "常用",
  },
  {
    title: "发送测试邮件",
    description: "测试邮件服务配置",
    href: "/settings/email",
    badge: "测试",
  },
];

export default function NavigationPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">导航中心</h1>
        <p className="text-muted-foreground">
          快速访问系统的所有功能模块
        </p>
      </div>

      {/* 快捷操作 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {action.badge}
                    </span>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 功能模块 */}
      <div className="space-y-8">
        {modules.map((module) => (
          <div key={module.category}>
            <h2 className="text-xl font-semibold mb-4">{module.category}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {module.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.title} href={item.href}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer h-full hover:scale-105">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className={`${item.color} p-3 rounded-lg text-white shrink-0`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base mb-1">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {item.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 系统信息 */}
      <div className="mt-12 pt-8 border-t">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">系统功能概览</CardTitle>
            <CardDescription>查看系统中已启用的功能模块</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>✅ 租金记录管理</span>
                <span className="text-muted-foreground">已启用</span>
              </div>
              <div className="flex justify-between">
                <span>✅ 数据可视化</span>
                <span className="text-muted-foreground">已启用</span>
              </div>
              <div className="flex justify-between">
                <span>✅ Excel 导出</span>
                <span className="text-muted-foreground">已启用</span>
              </div>
              <div className="flex justify-between">
                <span>✅ 邮件通知系统</span>
                <span className="text-muted-foreground">已启用</span>
              </div>
              <div className="flex justify-between">
                <span>✅ 定时任务 (Cron)</span>
                <span className="text-muted-foreground">已启用</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
