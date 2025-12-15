import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { emailService } from '@/lib/email';
import { EmailType } from '@prisma/client';

// POST /api/email/send - 发送邮件
export async function POST(request: NextRequest) {
  try {
    // 验证会话
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, html, type } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: '缺少必要参数: to, subject, html' },
        { status: 400 }
      );
    }

    const emailType = type || EmailType.SYSTEM_NOTIFICATION;

    // 发送邮件
    const emailLog = await emailService.sendEmail({
      to,
      subject,
      html,
      type: emailType as EmailType,
    });

    return NextResponse.json({
      success: true,
      message: '邮件发送成功',
      logId: emailLog.id,
    });
  } catch (error) {
    console.error('API发送邮件失败:', error);
    return NextResponse.json(
      {
        error: '邮件发送失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}