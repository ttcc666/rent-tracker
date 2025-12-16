import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { emailTemplateService } from '@/lib/email-templates';
import { EmailType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 这个 API 路由由 Vercel Cron Jobs 调用
// Cron 计划: 每月1号 UTC 01:00 (北京时间 09:00) 执行

export async function GET(request: NextRequest) {
  try {
    // 验证调用来源
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('开始执行月度账单任务:', new Date().toISOString());

    const results = {
      monthlyBills: 0,
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

    // 检查是否启用了月度账单
    if (!notificationSettings.monthlyBillEnabled) {
      console.log('月度账单功能已禁用，跳过邮件发送');
      return NextResponse.json({
        success: true,
        message: '月度账单功能已禁用',
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

    // 计算上个月的年月
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const yearMonth = lastMonth.toISOString().slice(0, 7); // YYYY-MM 格式

    // 查找上个月的记录
    const record = await prisma.record.findUnique({
      where: { yearMonth },
    });

    if (!record) {
      console.log(`未找到 ${yearMonth} 的记录，跳过月度账单发送`);
      return NextResponse.json({
        success: true,
        message: `未找到 ${yearMonth} 的记录`,
        results,
      });
    }

    try {
      const template = emailTemplateService.generateMonthlyBill({
        yearMonth,
        records: record,
        settings,
      });

      await emailService.sendEmail({
        to: settings.email,
        ...template,
        type: EmailType.MONTHLY_BILL,
      });

      results.monthlyBills = 1;
      console.log(`月度账单发送成功: ${yearMonth}`);

    } catch (error) {
      const errorMessage = `发送月度账单失败 (${yearMonth}): ${error instanceof Error ? error.message : '未知错误'}`;
      results.errors.push(errorMessage);
      console.error(errorMessage);
    }

    console.log('月度账单任务完成:', results);

    return NextResponse.json({
      success: true,
      message: '月度账单任务执行完成',
      timestamp: new Date().toISOString(),
      yearMonth,
      results,
    });

  } catch (error) {
    console.error('月度账单任务失败:', error);
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