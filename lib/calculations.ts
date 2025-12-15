import { Settings } from "@prisma/client";

/**
 * 计算各项费用
 */
export function calculateCosts(
  electricityUsage: number,
  coldWaterUsage: number,
  hotWaterUsage: number,
  settings: Settings
) {
  // 计算各项费用
  const electricityCost = electricityUsage * settings.electricityRate;
  const coldWaterCost = coldWaterUsage * settings.coldWaterRate;
  const hotWaterCost = hotWaterUsage * settings.hotWaterRate;

  // 计算水电费总计
  const utilitiesCost = electricityCost + coldWaterCost + hotWaterCost;

  // 计算总金额（租金 + 水电费）
  const totalAmount = settings.monthlyRent + utilitiesCost;

  return {
    electricityCost: Number(electricityCost.toFixed(2)),
    coldWaterCost: Number(coldWaterCost.toFixed(2)),
    hotWaterCost: Number(hotWaterCost.toFixed(2)),
    utilitiesCost: Number(utilitiesCost.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

/**
 * 格式化金额显示
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}
