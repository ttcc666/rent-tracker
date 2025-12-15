'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email';
import { emailTemplateService } from '@/lib/email-templates';
import { validateEmailConfig, validateNotificationSettings } from '@/lib/email-validation';
import { EmailType } from '@prisma/client';
import { calculateDaysUntilPayment } from '@/lib/date-utils';

// 获取邮件配置
export async function getEmailConfig() {
  try {
    const config = await prisma.emailConfig.findFirst();
    return config;
  } catch (error) {
    console.error('获取邮件配置失败:', error);
    throw new Error('获取邮件配置失败');
  }
}

// 更新邮件配置
export async function updateEmailConfig(configData: any) {
  try {
    // 验证配置数据
    const validatedConfig = validateEmailConfig(configData);

    await emailService.updateEmailConfig(validatedConfig);

    revalidatePath('/settings/email');
    return { success: true, message: '邮件配置更新成功' };
  } catch (error) {
    console.error('更新邮件配置失败:', error);
    throw new Error('更新邮件配置失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

// 测试邮件配置
export async function testEmailConfig(configData?: any) {
  try {
    if (configData) {
      // 测试新配置
      const validatedConfig = validateEmailConfig(configData);
      const isConfigured = await emailService.testConnection(validatedConfig);
      return { success: isConfigured, message: isConfigured ? '配置测试成功' : '配置测试失败' };
    } else {
      // 测试已保存的配置
      const isConfigured = await emailService.testConnection();
      if (!isConfigured) {
        return { success: false, message: '邮件服务未配置或配置错误' };
      }

      // 发送测试邮件
      const settings = await prisma.settings.findFirst();
      if (!settings?.email) {
        return { success: false, message: '请先设置用户邮箱地址' };
      }

      const testData = {
        testTime: new Date().toLocaleString('zh-CN'),
      };

      const template = emailTemplateService.generateTestEmail(testData);
      await emailService.sendEmail({
        to: settings.email,
        ...template,
        type: EmailType.TEST_EMAIL,
      });

      return { success: true, message: '测试邮件发送成功' };
    }
  } catch (error) {
    console.error('测试邮件配置失败:', error);
    return {
      success: false,
      message: '测试失败: ' + (error instanceof Error ? error.message : '未知错误')
    };
  }
}

// 更新通知设置
export async function updateNotificationSettings(settingsData: any) {
  try {
    // 验证设置数据
    const validatedSettings = validateNotificationSettings(settingsData);

    await prisma.notificationSettings.upsert({
      where: { id: 1 },
      update: validatedSettings,
      create: {
        id: 1,
        ...validatedSettings,
      },
    });

    revalidatePath('/settings/email');
    return { success: true, message: '通知设置更新成功' };
  } catch (error) {
    console.error('更新通知设置失败:', error);
    throw new Error('更新通知设置失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

// 获取通知设置
export async function getNotificationSettings() {
  try {
    let settings = await prisma.notificationSettings.findFirst();

    // 如果不存在，创建默认设置
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          id: 1,
          paymentReminderEnabled: true,
          paymentReminderDays: 3,
          overdueReminderEnabled: true,
          monthlyBillEnabled: true,
          systemNotificationEnabled: true,
        },
      });
    }

    return settings;
  } catch (error) {
    console.error('获取通知设置失败:', error);
    throw new Error('获取通知设置失败');
  }
}

// 更新用户邮箱地址
export async function updateUserEmail(email: string) {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('请输入有效的邮箱地址');
    }

    await prisma.settings.update({
      where: { id: 1 },
      data: { email },
    });

    revalidatePath('/settings/email');
    return { success: true, message: '邮箱地址更新成功' };
  } catch (error) {
    console.error('更新邮箱地址失败:', error);
    throw new Error('更新邮箱地址失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

// 获取邮件历史记录
export async function getEmailHistory(page = 1, limit = 20) {
  try {
    const history = await emailService.getEmailHistory(page, limit);
    return history;
  } catch (error) {
    console.error('获取邮件历史失败:', error);
    throw new Error('获取邮件历史失败');
  }
}

// 手动发送付款提醒
export async function sendPaymentReminder() {
  try {
    const settings = await prisma.settings.findFirst({
      include: {
        emailConfig: true,
      },
    });

    if (!settings?.email || !settings.emailConfig) {
      throw new Error('邮件服务未配置');
    }

    const daysUntilPayment = calculateDaysUntilPayment(settings.paymentDay);

    if (daysUntilPayment > 0) {
      const template = emailTemplateService.generatePaymentReminder({
        paymentDay: settings.paymentDay,
        daysUntilPayment,
        monthlyRent: settings.monthlyRent,
        dueDate: calculateDueDate(settings.paymentDay),
      });

      await emailService.sendEmail({
        to: settings.email,
        ...template,
        type: EmailType.PAYMENT_REMINDER,
      });

      revalidatePath('/email');
      return { success: true, message: '付款提醒发送成功' };
    } else {
      return { success: false, message: '当前不需要发送付款提醒' };
    }
  } catch (error) {
    console.error('发送付款提醒失败:', error);
    throw new Error('发送付款提醒失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

// 手动发送月度账单
export async function sendMonthlyBill(yearMonth: string) {
  try {
    const settings = await prisma.settings.findFirst({
      include: {
        emailConfig: true,
      },
    });

    if (!settings?.email || !settings.emailConfig) {
      throw new Error('邮件服务未配置');
    }

    const record = await prisma.record.findUnique({
      where: { yearMonth },
    });

    if (!record) {
      throw new Error('未找到指定月份的记录');
    }

    const template = emailTemplateService.generateMonthlyBill({
      yearMonth,
      records,
      settings,
    });

    await emailService.sendEmail({
      to: settings.email,
      ...template,
      type: EmailType.MONTHLY_BILL,
    });

    revalidatePath('/email');
    return { success: true, message: '月度账单发送成功' };
  } catch (error) {
    console.error('发送月度账单失败:', error);
    throw new Error('发送月度账单失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

// 检查邮件服务状态
export async function getEmailServiceStatus() {
  try {
    const [config, settings, isConfigured, testResult] = await Promise.all([
      getEmailConfig(),
      prisma.settings.findFirst(),
      emailService.isConfigured(),
      emailService.testConnection(),
    ]);

    return {
      hasConfig: !!config,
      hasUserEmail: !!settings?.email,
      isConfigured,
      canConnect: testResult,
      config: config ? {
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpSecure: config.smtpSecure,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
      } : null,
      userEmail: settings?.email || null,
    };
  } catch (error) {
    console.error('检查邮件服务状态失败:', error);
    return {
      hasConfig: false,
      hasUserEmail: false,
      isConfigured: false,
      canConnect: false,
      config: null,
      userEmail: null,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

// 辅助函数：计算付款日期
function calculateDueDate(paymentDay: number): string {
  const now = new Date();
  const dueDate = new Date(now.getFullYear(), now.getMonth(), paymentDay);

  // 如果付款日已过，设置为下个月的付款日
  if (dueDate < now) {
    dueDate.setMonth(dueDate.getMonth() + 1);
  }

  return dueDate.toLocaleDateString('zh-CN');
}