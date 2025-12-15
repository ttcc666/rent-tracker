import { redirect } from "next/navigation";
import { checkSetupStatus } from "@/app/actions/auth";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 检查初始化状态
  const { isSetup } = await checkSetupStatus();

  // 如果已设置，重定向到首页
  if (isSetup) {
    redirect("/");
  }

  return <>{children}</>;
}
