"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/session";

/**
 * 获取租金设置
 */
export async function getSettings() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    return { success: true, data: settings };
  } catch (error) {
    console.error("获取设置失败:", error);
    return { success: false, error: "获取设置失败" };
  }
}

/**
 * 更新租金设置
 */
export async function updateSettings(data: {
  monthlyRent: number;
  paymentDay: number;
  deposit: number;
  electricityRate: number;
  coldWaterRate: number;
  hotWaterRate: number;
}) {
  try {
    // 验证会话
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return { success: false, error: "未登录" };
    }

    // 验证数据
    if (data.paymentDay < 1 || data.paymentDay > 31) {
      return { success: false, error: "付款日必须在 1-31 之间" };
    }

    if (
      data.monthlyRent < 0 ||
      data.deposit < 0 ||
      data.electricityRate < 0 ||
      data.coldWaterRate < 0 ||
      data.hotWaterRate < 0
    ) {
      return { success: false, error: "金额不能为负数" };
    }

    // 更新设置
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        ...data,
      },
      update: data,
    });

    // 重新验证相关页面
    revalidatePath("/settings");
    revalidatePath("/");

    return { success: true, data: settings };
  } catch (error) {
    console.error("更新设置失败:", error);
    return { success: false, error: "更新设置失败，请重试" };
  }
}
