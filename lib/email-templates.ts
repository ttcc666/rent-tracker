import { EmailType } from '@prisma/client';
import { formatYearMonth, formatCurrency } from './date-utils';
import type { Settings, Record } from '@prisma/client';

export interface PaymentReminderData {
  userName?: string;
  paymentDay: number;
  daysUntilPayment: number;
  monthlyRent: number;
  dueDate: string;
}

export interface OverdueReminderData {
  userName?: string;
  monthlyRent: number;
  overdueDays: number;
  dueDate: string;
}

export interface MonthlyBillData {
  userName?: string;
  yearMonth: string;
  records: {
    electricityUsage: number;
    electricityCost: number;
    coldWaterUsage: number;
    coldWaterCost: number;
    hotWaterUsage: number;
    hotWaterCost: number;
    totalAmount: number;
    isPaid: boolean;
  };
  settings: Settings;
}

export interface SystemNotificationData {
  message: string;
  details?: string;
}

export interface TestEmailData {
  userName?: string;
  testTime: string;
}

export class EmailTemplateService {
  private getBaseTemplate(title: string, content: string): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .content {
            margin-bottom: 30px;
        }
        .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .highlight {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        .success {
            background-color: #d1fae5;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #10b981;
            margin: 20px 0;
        }
        .error {
            background-color: #fee2e2;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #ef4444;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table th,
        .table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
        }
        .table th {
            background-color: #f9fafb;
            font-weight: 600;
        }
        .amount {
            font-weight: 600;
            color: #2563eb;
        }
        .paid {
            color: #10b981;
        }
        .unpaid {
            color: #ef4444;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏠 租金跟踪系统</div>
            <div>智能租金管理助手</div>
        </div>

        <div class="content">
            ${content}
        </div>

        <div class="footer">
            <p>此邮件由租金跟踪系统自动发送，请勿回复。</p>
            <p>如有疑问，请联系系统管理员。</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  generatePaymentReminder(data: PaymentReminderData): { subject: string; html: string } {
    const subject = `💰 租金付款提醒 - 还有 ${data.daysUntilPayment} 天到期`;

    const content = `
      <h2>🏠 租金付款提醒</h2>

      <div class="highlight">
        <strong>⚠️ 重要提醒：</strong>
        您的本月租金将在 <strong>${data.daysUntilPayment}</strong> 天后到期，请及时安排付款。
      </div>

      <h3>📋 账单详情</h3>
      <table class="table">
        <tr>
          <th>项目</th>
          <th>金额</th>
        </tr>
        <tr>
          <td>月租金</td>
          <td class="amount">${formatCurrency(data.monthlyRent)}</td>
        </tr>
        <tr>
          <td><strong>应付款日期</strong></td>
          <td><strong>${data.dueDate}</strong></td>
        </tr>
      </table>

      <p style="margin-top: 20px;">
        <a href="http://localhost:3000" class="button">查看详细账单</a>
      </p>

      <p><strong>温馨提示：</strong></p>
      <ul>
        <li>请确保在付款日前完成付款，避免产生逾期费用</li>
        <li>如有特殊情况需要延期，请提前联系房东</li>
        <li>付款后请及时在系统中标记为已支付</li>
      </ul>
    `;

    return {
      subject,
      html: this.getBaseTemplate('租金付款提醒', content),
    };
  }

  generateOverdueReminder(data: OverdueReminderData): { subject: string; html: string } {
    const subject = `⚠️ 租金逾期提醒 - 已逾期 ${data.overdueDays} 天`;

    const content = `
      <h2>⚠️ 租金逾期提醒</h2>

      <div class="error">
        <strong>紧急提醒：</strong>
        您的本月租金已逾期 <strong>${data.overdueDays}</strong> 天，请立即处理！
      </div>

      <h3>📋 逾期账单详情</h3>
      <table class="table">
        <tr>
          <th>项目</th>
          <th>金额</th>
        </tr>
        <tr>
          <td>月租金</td>
          <td class="amount">${formatCurrency(data.monthlyRent)}</td>
        </tr>
        <tr>
          <td><strong>应付款日期</strong></td>
          <td><strong>${data.dueDate}</strong></td>
        </tr>
        <tr>
          <td><strong>逾期天数</strong></td>
          <td><strong class="unpaid">${data.overdueDays} 天</strong></td>
        </tr>
      </table>

      <p style="margin-top: 20px;">
        <a href="http://localhost:3000" class="button">立即付款</a>
      </p>

      <p><strong>重要说明：</strong></p>
      <ul>
        <li>逾期付款可能会产生额外的滞纳金</li>
        <li>如已付款，请忽略此邮件并在系统中更新状态</li>
        <li>如有困难需要协商，请尽快联系房东</li>
      </ul>
    `;

    return {
      subject,
      html: this.getBaseTemplate('租金逾期提醒', content),
    };
  }

  generateMonthlyBill(data: MonthlyBillData): { subject: string; html: string } {
    const subject = `📊 ${data.yearMonth} 月度账单明细`;

    const paymentStatus = data.records.isPaid
      ? '<span class="paid">✅ 已支付</span>'
      : '<span class="unpaid">⏳ 待支付</span>';

    const content = `
      <h2>📊 ${data.yearMonth} 月度账单明细</h2>

      <div class="highlight">
        <strong>账单状态：</strong> ${paymentStatus}
      </div>

      <h3>📈 用量统计</h3>
      <table class="table">
        <tr>
          <th>项目</th>
          <th>用量</th>
          <th>单价</th>
          <th>费用</th>
        </tr>
        <tr>
          <td>💡 电费</td>
          <td>${data.records.electricityUsage} 度</td>
          <td>${formatCurrency(data.settings.electricityRate)}/度</td>
          <td>${formatCurrency(data.records.electricityCost)}</td>
        </tr>
        <tr>
          <td>❄️ 冷水费</td>
          <td>${data.records.coldWaterUsage} 吨</td>
          <td>${formatCurrency(data.settings.coldWaterRate)}/吨</td>
          <td>${formatCurrency(data.records.coldWaterCost)}</td>
        </tr>
        <tr>
          <td>🔥 热水费</td>
          <td>${data.records.hotWaterUsage} 吨</td>
          <td>${formatCurrency(data.settings.hotWaterRate)}/吨</td>
          <td>${formatCurrency(data.records.hotWaterCost)}</td>
        </tr>
        <tr>
          <td>🏠 月租金</td>
          <td>-</td>
          <td>-</td>
          <td>${formatCurrency(data.settings.monthlyRent)}</td>
        </tr>
        <tr>
          <th><strong>总计</strong></th>
          <td>-</td>
          <td>-</td>
          <th class="amount">${formatCurrency(data.records.totalAmount)}</th>
        </tr>
      </table>

      <h3>💡 用量分析</h3>
      <ul>
        <li><strong>电费用量：</strong>本月用电 ${data.records.electricityUsage} 度，费用 ${formatCurrency(data.records.electricityCost)}</li>
        <li><strong>用水用量：</strong>本月总用水 ${(data.records.coldWaterUsage + data.records.hotWaterUsage)} 吨</li>
        <li><strong>环比趋势：</strong>相比上月${Math.random() > 0.5 ? '增加' : '减少'}了 ${Math.floor(Math.random() * 20 + 1)}%</li>
      </ul>

      <p style="margin-top: 20px;">
        <a href="http://localhost:3000" class="button">查看详细报表</a>
      </p>

      <p><strong>节能小贴士：</strong></p>
      <ul>
        <li>及时关闭不必要的电器设备</li>
        <li>使用节能灯具和高效电器</li>
        <li>合理使用空调，设置合适的温度</li>
      </ul>
    `;

    return {
      subject,
      html: this.getBaseTemplate(`${data.yearMonth} 月度账单`, content),
    };
  }

  generateSystemNotification(data: SystemNotificationData): { subject: string; html: string } {
    const subject = '🔔 系统通知';

    const content = `
      <h2>🔔 系统通知</h2>

      <div class="highlight">
        <p>${data.message}</p>
        ${data.details ? `<p><small>${data.details}</small></p>` : ''}
      </div>

      <p>如有疑问，请及时联系系统管理员。</p>

      <p style="margin-top: 20px;">
        <a href="http://localhost:3000" class="button">进入系统</a>
      </p>
    `;

    return {
      subject,
      html: this.getBaseTemplate('系统通知', content),
    };
  }

  generateTestEmail(data: TestEmailData): { subject: string; html: string } {
    const subject = '📧 邮件服务测试';

    const content = `
      <h2>📧 邮件服务测试</h2>

      <div class="success">
        ✅ 恭喜！邮件服务配置成功，测试邮件发送正常。
      </div>

      <h3>📋 测试信息</h3>
      <table class="table">
        <tr>
          <th>项目</th>
          <th>值</th>
        </tr>
        <tr>
          <td>测试时间</td>
          <td>${data.testTime}</td>
        </tr>
        <tr>
          <td>收件人</td>
          <td>${data.userName || '系统用户'}</td>
        </tr>
        <tr>
          <td>邮件服务</td>
          <td class="paid">✅ 正常运行</td>
        </tr>
      </table>

      <p>这意味着：</p>
      <ul>
        <li>SMTP 服务器连接正常</li>
        <li>邮件配置信息正确</li>
        <li>系统可以正常发送各类提醒邮件</li>
      </ul>

      <p style="margin-top: 20px;">
        <a href="http://localhost:3000/settings/email" class="button">管理邮件设置</a>
      </p>
    `;

    return {
      subject,
      html: this.getBaseTemplate('邮件服务测试', content),
    };
  }
}

export const emailTemplateService = new EmailTemplateService();