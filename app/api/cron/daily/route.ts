import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { emailTemplateService } from '@/lib/email-templates';
import { EmailType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { calculateDaysUntilPayment } from '@/lib/date-utils';

// 这个 API 路由由 Vercel Cron Jobs 调用
// Cron 计划: 每天 UTC 00:00 (北京时间 08:00) 执行

export async function GET(request: NextRequest) {
  try {
    // 验证调用来源（Vercel Cron Jobs 会发送特殊的头部）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('开始执行每日邮件检查任务:', new Date().toISOString());

    const results = {
      paymentReminders: 0,
      overdueReminders: 0,
      errors: [] as string[],
    };

    // 获取必要的配置
    const [settings, notificationSettings] = await Promise.all([
      prisma.settings.findFirst({
        include: {
          emailConfig: true,
        },
      }),
      prisma.notificationSettings.findFirst(),
    ]);

    // 检查邮件服务是否已配置
    if (!settings?.email || !settings.emailConfig || !notificationSettings) {
      console.log('邮件服务或通知设置未配置，跳过邮件发送');
      return NextResponse.json({
        success: true,
        message: '邮件服务未配置，跳过任务',
        results,
      });
    }

    // 检查邮件服务连接
    const canConnect = await emailService.testConnection();
    if (!canConnect) {
      console.log('邮件服务连接失败，跳过邮件发送');
      return NextResponse.json({
        success: true,
        message: '邮件服务连接失败，跳过任务',
        results,
      });
    }

    const now = new Date();
    const currentDay = now.getDate();
    const paymentDay = settings.paymentDay;

    // 1. 检查是否需要发送付款提醒
    if (notificationSettings.paymentReminderEnabled) {
      const daysUntilPayment = calculateDaysUntilPayment(paymentDay);

      if (daysUntilPayment === notificationSettings.paymentReminderDays) {
        try {
          const template = emailTemplateService.generatePaymentReminder({
            paymentDay,
            daysUntilPayment,
            monthlyRent: settings.monthlyRent,
            dueDate: calculateDueDate(paymentDay),
          });

          await emailService.sendEmail({
            to: settings.email,
            ...template,
            type: EmailType.PAYMENT_REMINDER,
          });

          results.paymentReminders = 1;
          console.log('付款提醒发送成功');
        } catch (error) {
          const errorMessage = `发送付款提醒失败: ${error instanceof Error ? error.message : '未知错误'}`;
          results.errors.push(errorMessage);
          console.error(errorMessage);
        }
      }
    }

    // 2. 检查是否需要发送逾期提醒
    if (notificationSettings.overdueReminderEnabled) {
      const daysSincePayment = calculateDaysSincePayment(paymentDay);

      // 付款日后 1-7 天内每天发送逾期提醒
      if (daysSincePayment > 0 && daysSincePayment <= 7) {
        try {
          const template = emailTemplateService.generateOverdueReminder({
            paymentDay,
            overdueDays: daysSincePayment,
            monthlyRent: settings.monthlyRent,
            dueDate: calculateLastDueDate(paymentDay),
          });

          await emailService.sendEmail({
            to: settings.email,
            ...template,
            type: EmailType.OVERDUE_REMINDER,
          });

          results.overdueReminders = 1;
          console.log('逾期提醒发送成功');
        } catch (error) {
          const errorMessage = `发送逾期提醒失败: ${error instanceof Error ? error.message : '未知错误'}`;
          results.errors.push(errorMessage);
          console.error(errorMessage);
        }
      }
    }

    console.log('每日邮件检查任务完成:', results);

    return NextResponse.json({
      success: true,
      message: '每日任务执行完成',
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (error) {
    console.error('每日邮件检查任务失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '任务执行失败',
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
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

// 辅助函数：计算上次付款日期
function calculateLastDueDate(paymentDay: number): string {
  const now = new Date();
  const lastDueDate = new Date(now.getFullYear(), now.getMonth(), paymentDay);

  // 如果这个月的付款日还没到，设置为上个月的付款日
  if (lastDueDate > now) {
    lastDueDate.setMonth(lastDueDate.getMonth() - 1);
  }

  return lastDueDate.toLocaleDateString('zh-CN');
}

// 辅助函数：计算距离付款日过去了多少天
function calculateDaysSincePayment(paymentDay: number): number {
  const now = new Date();
  const currentDay = now.getDate();

  if (currentDay > paymentDay) {
    return currentDay - paymentDay;
  } else {
    // 当前日期小于付款日，说明已经进入了下个月
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // 上个月的最后一天
    const lastMonthDays = lastMonth.getDate();
    return currentDay + (lastMonthDays - paymentDay);
  }
}