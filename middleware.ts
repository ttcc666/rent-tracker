import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路由（不需要认证）
  const publicRoutes = ["/login", "/setup"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // 静态资源和 API 路由不需要检查
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    // 如果是公开路由，允许访问
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // 验证会话
    const isAuthenticated = await verifySession();

    if (!isAuthenticated) {
      // 未登录，重定向到登录页
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 已登录，允许访问
    return NextResponse.next();
  } catch (error) {
    console.error("中间件错误:", error);
    // 发生错误时，重定向到登录页
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
