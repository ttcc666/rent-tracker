import nodemailer from 'nodemailer';
import { EmailConfig, EmailLog, EmailType, EmailStatus } from '@prisma/client';
import { prisma } from './prisma';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
}

export interface EmailServiceConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  fromName: string;
  fromEmail: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      const config = await this.getEmailConfig();
      if (!config) {
        throw new Error('邮件服务未配置');
      }

      this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPassword,
        },
      });
    }
    return this.transporter;
  }

  private async getEmailConfig(): Promise<EmailServiceConfig | null> {
    const emailConfig = await prisma.emailConfig.findFirst({
      include: {
        settings: true,
      },
    });

    if (!emailConfig) {
      return null;
    }

    return {
      smtpHost: emailConfig.smtpHost,
      smtpPort: emailConfig.smtpPort,
      smtpSecure: emailConfig.smtpSecure,
      smtpUser: emailConfig.smtpUser,
      smtpPassword: emailConfig.smtpPassword,
      fromName: emailConfig.fromName,
      fromEmail: emailConfig.fromEmail,
    };
  }

  async testConnection(config?: EmailServiceConfig): Promise<boolean> {
    try {
      const transporter = config
        ? nodemailer.createTransport({
            host: config.smtpHost,
            port: config.smtpPort,
            secure: config.smtpSecure,
            auth: {
              user: config.smtpUser,
              pass: config.smtpPassword,
            },
          })
        : await this.getTransporter();

      await transporter.verify();
      return true;
    } catch (error) {
      console.error('邮件服务连接测试失败:', error);
      return false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailLog> {
    try {
      // 首先创建待发送的邮件日志
      const emailLog = await prisma.emailLog.create({
        data: {
          toEmail: options.to,
          subject: options.subject,
          content: options.html,
          type: options.type,
          status: EmailStatus.PENDING,
        },
      });

      const transporter = await this.getTransporter();
      const config = await this.getEmailConfig();

      if (!config) {
        throw new Error('邮件服务未配置');
      }

      const mailOptions = {
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      await transporter.sendMail(mailOptions);

      // 更新邮件日志状态为已发送
      const updatedLog = await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.SENT,
        },
      });

      return updatedLog;
    } catch (error) {
      console.error('邮件发送失败:', error);

      // 如果有邮件日志记录，更新为失败状态
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      try {
        const emailLog = await prisma.emailLog.findFirst({
          where: {
            toEmail: options.to,
            subject: options.subject,
            status: EmailStatus.PENDING,
          },
          orderBy: {
            sentAt: 'desc',
          },
        });

        if (emailLog) {
          await prisma.emailLog.update({
            where: { id: emailLog.id },
            data: {
              status: EmailStatus.FAILED,
              errorMessage: errorMessage,
            },
          });
        }
      } catch (logError) {
        console.error('更新邮件日志失败:', logError);
      }

      throw error;
    }
  }

  async isConfigured(): Promise<boolean> {
    const config = await this.getEmailConfig();
    return config !== null;
  }

  async updateEmailConfig(config: Partial<EmailServiceConfig>): Promise<void> {
    await prisma.emailConfig.upsert({
      where: { id: 1 },
      update: config,
      create: {
        id: 1,
        smtpHost: config.smtpHost || '',
        smtpPort: config.smtpPort || 587,
        smtpSecure: config.smtpSecure || false,
        smtpUser: config.smtpUser || '',
        smtpPassword: config.smtpPassword || '',
        fromName: config.fromName || '租金跟踪系统',
        fromEmail: config.fromEmail || '',
      },
    });

    // 重置传输器，下次发送时使用新配置
    this.transporter = null;
  }

  async getEmailHistory(page = 1, limit = 20): Promise<{
    logs: EmailLog[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        skip,
        take: limit,
        orderBy: {
          sentAt: 'desc',
        },
      }),
      prisma.emailLog.count(),
    ]);

    return {
      logs,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

// 导出单例实例
export const emailService = new EmailService();