import { differenceInDays, setDate, addMonths, isBefore, format } from "date-fns";
import { zhCN } from "date-fns/locale";

/**
 * 计算距离付款日的剩余天数
 */
export function calculateDaysUntilPayment(paymentDay: number): number {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // 本月的付款日
  let paymentDate = setDate(new Date(currentYear, currentMonth, 1), paymentDay);

  // 如果本月付款日已过，计算下个月的
  if (isBefore(paymentDate, today)) {
    paymentDate = addMonths(paymentDate, 1);
  }

  return differenceInDays(paymentDate, today);
}

/**
 * 格式化年月字符串（YYYY-MM）
 */
export function formatYearMonth(date: Date): string {
  return format(date, "yyyy-MM");
}

/**
 * 获取当前年月
 */
export function getCurrentYearMonth(): string {
  return formatYearMonth(new Date());
}

/**
 * 解析年月字符串为 Date 对象
 */
export function parseYearMonth(yearMonth: string): Date {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

/**
 * 格式化日期显示（中文）
 */
export function formatDate(date: Date): string {
  return format(date, "yyyy年MM月dd日", { locale: zhCN });
}

/**
 * 格式化年月显示（中文）
 */
export function formatYearMonthChinese(yearMonth: string): string {
  const date = parseYearMonth(yearMonth);
  return format(date, "yyyy年MM月", { locale: zhCN });
}

/**
 * 格式化货币显示
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
