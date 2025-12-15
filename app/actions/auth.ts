"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSession, deleteSession, verifySession } from "@/lib/session";

/**
 * 检查系统是否已完成初始设置
 */
export async function checkSetupStatus() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id: 1 },
    });

    return {
      isSetup: config?.isSetup ?? false,
    };
  } catch (error) {
    console.error("检查设置状态失败:", error);
    return { isSetup: false };
  }
}

/**
 * 初始设置（创建密码和租金配置）
 */
export async function setupSystem(
  password: string,
  settings: {
    monthlyRent: number;
    paymentDay: number;
    deposit: number;
    electricityRate: number;
    coldWaterRate: number;
    hotWaterRate: number;
  }
) {
  try {
    // 检查是否已设置
    const existingConfig = await prisma.systemConfig.findUnique({
      where: { id: 1 },
    });

    if (existingConfig?.isSetup) {
      return { success: false, error: "系统已完成初始设置" };
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建系统配置
    await prisma.systemConfig.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        password: hashedPassword,
        isSetup: true,
      },
      update: {
        password: hashedPassword,
        isSetup: true,
      },
    });

    // 创建租金设置
    await prisma.settings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        ...settings,
      },
      update: settings,
    });

    // 创建会话
    await createSession();

    return { success: true };
  } catch (error) {
    console.error("初始设置失败:", error);
    return { success: false, error: "设置失败，请重试" };
  }
}

/**
 * 用户登录
 */
export async function login(password: string) {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id: 1 },
    });

    if (!config) {
      return { success: false, error: "系统未初始化" };
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, config.password);

    if (!isValid) {
      return { success: false, error: "密码错误" };
    }

    // 创建会话
    await createSession();

    return { success: true };
  } catch (error) {
    console.error("登录失败:", error);
    return { success: false, error: "登录失败，请重试" };
  }
}

/**
 * 用户登出
 */
export async function logout() {
  await deleteSession();
  redirect("/login");
}

/**
 * 验证当前会话
 */
export async function validateSession() {
  return await verifySession();
}

/**
 * 修改密码
 */
export async function changePassword(oldPassword: string, newPassword: string) {
  try {
    // 验证会话
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return { success: false, error: "未登录" };
    }

    const config = await prisma.systemConfig.findUnique({
      where: { id: 1 },
    });

    if (!config) {
      return { success: false, error: "系统配置不存在" };
    }

    // 验证旧密码
    const isValid = await bcrypt.compare(oldPassword, config.password);
    if (!isValid) {
      return { success: false, error: "原密码错误" };
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await prisma.systemConfig.update({
      where: { id: 1 },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("修改密码失败:", error);
    return { success: false, error: "修改密码失败，请重试" };
  }
}
