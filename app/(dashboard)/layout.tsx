import { redirect } from "next/navigation";
import { Nav } from "@/components/layout/nav";
import { checkSetupStatus } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 检查初始化状态
  const { isSetup } = await checkSetupStatus();

  // 如果未设置，重定向到设置页面
  if (!isSetup) {
    redirect("/setup");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
