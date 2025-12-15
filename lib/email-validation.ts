import { z } from 'zod';

// 邮箱地址验证
export const emailSchema = z.string().email('请输入有效的邮箱地址');

// SMTP 配置验证
export const smtpConfigSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP服务器地址不能为空'),
  smtpPort: z.number().int().min(1).max(65535, '端口号必须在1-65535之间'),
  smtpSecure: z.boolean(),
  smtpUser: z.string().min(1, 'SMTP用户名不能为空'),
  smtpPassword: z.string().min(1, 'SMTP密码不能为空'),
  fromName: z.string().min(1, '发件人名称不能为空'),
  fromEmail: emailSchema,
});

// 通知设置验证
export const notificationSettingsSchema = z.object({
  paymentReminderEnabled: z.boolean(),
  paymentReminderDays: z.number().int().min(1).max(30, '提醒天数必须在1-30天之间'),
  overdueReminderEnabled: z.boolean(),
  monthlyBillEnabled: z.boolean(),
  systemNotificationEnabled: z.boolean(),
});

// 常用邮箱服务商预设配置
export const emailProviders = {
  gmail: {
    name: 'Gmail',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: false,
    description: 'Google Gmail 服务',
    note: '需要开启"两步验证"并使用"应用专用密码"',
  },
  qq: {
    name: 'QQ邮箱',
    smtpHost: 'smtp.qq.com',
    smtpPort: 587,
    smtpSecure: false,
    description: '腾讯 QQ 邮箱服务',
    note: '需要开启SMTP服务并获取授权码',
  },
  '163': {
    name: '163邮箱',
    smtpHost: 'smtp.163.com',
    smtpPort: 465,
    smtpSecure: true,
    description: '网易 163 邮箱服务',
    note: '需要开启SMTP服务并设置客户端授权密码',
  },
  '126': {
    name: '126邮箱',
    smtpHost: 'smtp.126.com',
    smtpPort: 465,
    smtpSecure: true,
    description: '网易 126 邮箱服务',
    note: '需要开启SMTP服务并设置客户端授权密码',
  },
  outlook: {
    name: 'Outlook',
    smtpHost: 'smtp-mail.outlook.com',
    smtpPort: 587,
    smtpSecure: false,
    description: 'Microsoft Outlook 服务',
    note: '使用 Outlook 账号密码直接登录',
  },
  yahoo: {
    name: 'Yahoo Mail',
    smtpHost: 'smtp.mail.yahoo.com',
    smtpPort: 587,
    smtpSecure: false,
    description: 'Yahoo 邮件服务',
    note: '需要开启"两步验证"并使用"应用专用密码"',
  },
  // 企业邮箱配置示例
  aliyun: {
    name: '阿里企业邮箱',
    smtpHost: 'smtp.mxhichina.com',
    smtpPort: 587,
    smtpSecure: false,
    description: '阿里云企业邮箱服务',
    note: '使用企业邮箱账号密码登录',
  },
  tencent: {
    name: '腾讯企业邮箱',
    smtpHost: 'smtp.exmail.qq.com',
    smtpPort: 587,
    smtpSecure: false,
    description: '腾讯企业邮箱服务',
    note: '使用企业邮箱账号密码登录',
  },
};

export type EmailProvider = keyof typeof emailProviders;

export function getEmailProviderConfig(provider: EmailProvider) {
  return emailProviders[provider];
}

export function validateEmailConfig(config: unknown) {
  return smtpConfigSchema.parse(config);
}

export function validateNotificationSettings(settings: unknown) {
  return notificationSettingsSchema.parse(settings);
}

export function validateEmail(email: unknown) {
  return emailSchema.parse(email);
}

// 邮箱格式检测
export function detectEmailProvider(email: string): EmailProvider | null {
  const domain = email.toLowerCase().split('@')[1];

  if (domain?.endsWith('gmail.com')) return 'gmail';
  if (domain?.endsWith('qq.com')) return 'qq';
  if (domain?.endsWith('163.com')) return '163';
  if (domain?.endsWith('126.com')) return '126';
  if (domain?.endsWith('outlook.com') || domain?.endsWith('hotmail.com')) return 'outlook';
  if (domain?.endsWith('yahoo.com') || domain?.endsWith('yahoodns.net')) return 'yahoo';
  if (domain?.endsWith('aliyun.com') || domain?.endsWith('aliyun-inc.com')) return 'aliyun';
  if (domain?.endsWith('exmail.qq.com')) return 'tencent';

  return null;
}

// 自动填充SMTP配置
export function autoFillSmtpConfig(email: string) {
  const provider = detectEmailProvider(email);
  if (!provider) return null;

  const config = getEmailProviderConfig(provider);
  return {
    smtpHost: config.smtpHost,
    smtpPort: config.smtpPort,
    smtpSecure: config.smtpSecure,
    smtpUser: email,
  };
}

// 测试邮件内容模板
export const testEmailContent = {
  subject: '租金跟踪系统 - 邮件服务测试',
  text: '这是一封测试邮件，用于验证邮件服务配置是否正确。如果您收到此邮件，说明邮件服务工作正常。',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>邮件服务测试</title>
    </head>
    <body>
        <h2>📧 邮件服务测试成功</h2>
        <p>这是一封测试邮件，用于验证邮件服务配置是否正确。</p>
        <p>如果您收到此邮件，说明：</p>
        <ul>
            <li>✅ SMTP 服务器连接正常</li>
            <li>✅ 身份验证成功</li>
            <li>✅ 邮件发送功能正常</li>
        </ul>
        <p>测试时间：${new Date().toLocaleString('zh-CN')}</p>
    </body>
    </html>
  `,
};

// 错误消息映射
export const emailErrorMessages = {
  'ECONNECTION': '无法连接到邮件服务器，请检查服务器地址和端口',
  'EAUTH': '用户名或密码错误，请检查SMTP认证信息',
  'EMESSAGE': '邮件内容格式错误，请检查邮件模板',
  'EENVELOPE': '收件人地址格式错误',
  'ETIMEDOUT': '连接超时，请检查网络连接',
  'ESOCKET': '网络连接错误，请稍后重试',
  'EPROTOCOL': '协议错误，请检查SMTP配置',
  'DEFAULT': '邮件发送失败，请检查配置后重试',
};

export function getErrorMessage(error: any): string {
  const code = error?.code;
  return emailErrorMessages[code as keyof typeof emailErrorMessages] || emailErrorMessages.DEFAULT;
}