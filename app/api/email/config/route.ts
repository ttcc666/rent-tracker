import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { emailService } from '@/lib/email';
import { validateEmailConfig } from '@/lib/email-validation';

// GET /api/email/config - 获取邮件配置（隐藏敏感信息）
export async function GET() {
  try {
    // 验证会话
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const config = await emailService.isConfigured();
    return NextResponse.json({
      isConfigured: config,
    });
  } catch (error) {
    console.error('API获取邮件配置失败:', error);
    return NextResponse.json(
      { error: '获取邮件配置失败' },
      { status: 500 }
    );
  }
}

// POST /api/email/config - 更新邮件配置
export async function POST(request: NextRequest) {
  try {
    // 验证会话
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const config = body.config;

    if (!config) {
      return NextResponse.json(
        { error: '缺少配置信息' },
        { status: 400 }
      );
    }

    // 验证配置
    const validatedConfig = validateEmailConfig(config);

    // 更新配置
    await emailService.updateEmailConfig(validatedConfig);

    return NextResponse.json({
      success: true,
      message: '邮件配置更新成功',
    });
  } catch (error) {
    console.error('API更新邮件配置失败:', error);
    return NextResponse.json(
      {
        error: '更新邮件配置失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}