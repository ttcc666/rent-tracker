import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { emailService } from '@/lib/email';
import { emailTemplateService } from '@/lib/email-templates';
import { validateEmailConfig } from '@/lib/email-validation';
import { EmailType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// POST /api/email/test - 测试邮件配置或发送测试邮件
export async function POST(request: NextRequest) {
  try {
    // 验证会话
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { config, sendTestEmail } = body;

    if (config) {
      // 测试新配置
      try {
        const validatedConfig = validateEmailConfig(config);
        const canConnect = await emailService.testConnection(validatedConfig);

        return NextResponse.json({
          success: canConnect,
          message: canConnect ? '配置测试成功，可以连接到邮件服务器' : '配置测试失败，无法连接到邮件服务器',
        });
      } catch (validationError) {
        return NextResponse.json(
          {
            success: false,
            message: '配置验证失败: ' + (validationError instanceof Error ? validationError.message : '未知错误'),
          },
          { status: 400 }
        );
      }
    }

    if (sendTestEmail) {
      // 发送测试邮件
      const settings = await prisma.settings.findFirst();
      if (!settings?.email) {
        return NextResponse.json(
          { success: false, message: '请先在设置中配置用户邮箱地址' },
          { status: 400 }
        );
      }

      try {
        const testData = {
          testTime: new Date().toLocaleString('zh-CN'),
        };

        const template = emailTemplateService.generateTestEmail(testData);
        await emailService.sendEmail({
          to: settings.email,
          ...template,
          type: EmailType.TEST_EMAIL,
        });

        return NextResponse.json({
          success: true,
          message: `测试邮件已发送至 ${settings.email}，请查收`,
        });
      } catch (sendError) {
        return NextResponse.json(
          {
            success: false,
            message: '发送测试邮件失败: ' + (sendError instanceof Error ? sendError.message : '未知错误'),
          },
          { status: 500 }
        );
      }
    }

    // 测试当前保存的配置
    const isConfigured = await emailService.isConfigured();
    if (!isConfigured) {
      return NextResponse.json(
        { success: false, message: '邮件服务未配置' },
        { status: 400 }
      );
    }

    const canConnect = await emailService.testConnection();
    return NextResponse.json({
      success: canConnect,
      message: canConnect ? '当前配置正常' : '当前配置测试失败',
    });
  } catch (error) {
    console.error('API测试邮件失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '测试失败: ' + (error instanceof Error ? error.message : '未知错误'),
      },
      { status: 500 }
    );
  }
}