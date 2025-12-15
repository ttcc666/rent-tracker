"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { calculateCosts } from "@/lib/calculations";

/**
 * 获取所有记录（按日期降序）
 */
export async function getRecords() {
  try {
    const records = await prisma.record.findMany({
      orderBy: {
        yearMonth: "desc",
      },
    });

    return { success: true, data: records };
  } catch (error) {
    console.error("获取记录失败:", error);
    return { success: false, error: "获取记录失败" };
  }
}

/**
 * 获取单条记录
 */
export async function getRecordById(id: number) {
  try {
    const record = await prisma.record.findUnique({
      where: { id },
    });

    if (!record) {
      return { success: false, error: "记录不存在" };
    }

    return { success: true, data: record };
  } catch (error) {
    console.error("获取记录失败:", error);
    return { success: false, error: "获取记录失败" };
  }
}

/**
 * 获取当月记录
 */
export async function getCurrentMonthRecord(yearMonth: string) {
  try {
    const record = await prisma.record.findUnique({
      where: { yearMonth },
    });

    return { success: true, data: record };
  } catch (error) {
    console.error("获取当月记录失败:", error);
    return { success: false, error: "获取当月记录失败" };
  }
}

/**
 * 创建记录
 */
export async function createRecord(data: {
  yearMonth: string;
  electricityUsage: number;
  coldWaterUsage: number;
  hotWaterUsage: number;
  note?: string;
}) {
  try {
    // 验证会话
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return { success: false, error: "未登录" };
    }

    // 验证数据
    if (
      data.electricityUsage < 0 ||
      data.coldWaterUsage < 0 ||
      data.hotWaterUsage < 0
    ) {
      return { success: false, error: "用量不能为负数" };
    }

    // 检查是否已存在该月记录
    const existing = await prisma.record.findUnique({
      where: { yearMonth: data.yearMonth },
    });

    if (existing) {
      return { success: false, error: "该月记录已存在" };
    }

    // 获取设置
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return { success: false, error: "请先完成租金设置" };
    }

    // 计算费用
    const costs = calculateCosts(
      data.electricityUsage,
      data.coldWaterUsage,
      data.hotWaterUsage,
      settings
    );

    // 创建记录
    const record = await prisma.record.create({
      data: {
        yearMonth: data.yearMonth,
        electricityUsage: data.electricityUsage,
        electricityCost: costs.electricityCost,
        coldWaterUsage: data.coldWaterUsage,
        coldWaterCost: costs.coldWaterCost,
        hotWaterUsage: data.hotWaterUsage,
        hotWaterCost: costs.hotWaterCost,
        totalAmount: costs.totalAmount,
        note: data.note,
      },
    });

    // 重新验证相关页面
    revalidatePath("/");
    revalidatePath("/records");

    return { success: true, data: record };
  } catch (error) {
    console.error("创建记录失败:", error);
    return { success: false, error: "创建记录失败，请重试" };
  }
}

/**
 * 更新记录
 */
export async function updateRecord(
  id: number,
  data: {
    electricityUsage: number;
    coldWaterUsage: number;
    hotWaterUsage: number;
    note?: string;
  }
) {
  try {
    // 验证会话
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return { success: false, error: "未登录" };
    }

    // 验证数据
    if (
      data.electricityUsage < 0 ||
      data.coldWaterUsage < 0 ||
      data.hotWaterUsage < 0
    ) {
      return { success: false, error: "用量不能为负数" };
    }

    // 获取设置
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return { success: false, error: "请先完成租金设置" };
    }

    // 计算费用
    const costs = calculateCosts(
      data.electricityUsage,
      data.coldWaterUsage,
      data.hotWaterUsage,
      settings
    );

    // 更新记录
    const record = await prisma.record.update({
      where: { id },
      data: {
        electricityUsage: data.electricityUsage,
        electricityCost: costs.electricityCost,
        coldWaterUsage: data.coldWaterUsage,
        coldWaterCost: costs.coldWaterCost,
        hotWaterUsage: data.hotWaterUsage,
        hotWaterCost: costs.hotWaterCost,
        totalAmount: costs.totalAmount,
        note: data.note,
      },
    });

    // 重新验证相关页面
    revalidatePath("/");
    revalidatePath("/records");
    revalidatePath(`/records/${id}/edit`);

    return { success: true, data: record };
  } catch (error) {
    console.error("更新记录失败:", error);
    return { success: false, error: "更新记录失败，请重试" };
  }
}

/**
 * 删除记录
 */
export async function deleteRecord(id: number) {
  try {
    // 验证会话
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return { success: false, error: "未登录" };
    }

    await prisma.record.delete({
      where: { id },
    });

    // 重新验证相关页面
    revalidatePath("/");
    revalidatePath("/records");

    return { success: true };
  } catch (error) {
    console.error("删除记录失败:", error);
    return { success: false, error: "删除记录失败，请重试" };
  }
}

/**
 * 切换支付状态
 */
export async function togglePaidStatus(id: number) {
  try {
    // 验证会话
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return { success: false, error: "未登录" };
    }

    const record = await prisma.record.findUnique({
      where: { id },
    });

    if (!record) {
      return { success: false, error: "记录不存在" };
    }

    const updated = await prisma.record.update({
      where: { id },
      data: {
        isPaid: !record.isPaid,
      },
    });

    // 重新验证相关页面
    revalidatePath("/");
    revalidatePath("/records");

    return { success: true, data: updated };
  } catch (error) {
    console.error("切换支付状态失败:", error);
    return { success: false, error: "操作失败，请重试" };
  }
}

/**
 * 获取统计数据
 */
export async function getStatistics() {
  try {
    const records = await prisma.record.findMany();

    const totalRecords = records.length;
    const paidRecords = records.filter((r) => r.isPaid).length;
    const unpaidRecords = totalRecords - paidRecords;
    const totalAmount = records.reduce((sum, r) => sum + r.totalAmount, 0);
    const paidAmount = records
      .filter((r) => r.isPaid)
      .reduce((sum, r) => sum + r.totalAmount, 0);
    const unpaidAmount = totalAmount - paidAmount;

    return {
      success: true,
      data: {
        totalRecords,
        paidRecords,
        unpaidRecords,
        totalAmount: Number(totalAmount.toFixed(2)),
        paidAmount: Number(paidAmount.toFixed(2)),
        unpaidAmount: Number(unpaidAmount.toFixed(2)),
      },
    };
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return { success: false, error: "获取统计数据失败" };
  }
}
