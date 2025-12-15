"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, FileText, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";

const navItems = [
  {
    title: "首页",
    href: "/",
    icon: Home,
  },
  {
    title: "记录管理",
    href: "/records",
    icon: FileText,
  },
  {
    title: "设置",
    href: "/settings",
    icon: Settings,
  },
];

export function Nav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-primary">
              租金跟踪
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">登出</span>
          </Button>
        </div>

        {/* 移动端导航 */}
        <div className="md:hidden flex items-center gap-1 pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
