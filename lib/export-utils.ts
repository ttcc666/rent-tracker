import ExcelJS from "exceljs";
import { Record } from "@prisma/client";

/**
 * 统计数据接口
 */
interface Statistics {
  totalRecords: number;
  paidRecords: number;
  unpaidRecords: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

/**
 * 导出记录到 Excel 文件
 * @param records 记录数组
 * @param statistics 统计数据
 */
export async function exportRecordsToExcel(
  records: Record[],
  statistics: Statistics
) {
  try {
    // 创建工作簿
    const workbook = new ExcelJS.Workbook();

    // ========== 工作表1：记录明细 ==========
    const recordsSheet = workbook.addWorksheet("记录明细");

    // 定义列
    recordsSheet.columns = [
      { header: "月份", key: "yearMonth", width: 12 },
      { header: "用电量(度)", key: "electricityUsage", width: 14 },
      { header: "电费(元)", key: "electricityCost", width: 12 },
      { header: "冷水用量(吨)", key: "coldWaterUsage", width: 16 },
      { header: "冷水费(元)", key: "coldWaterCost", width: 12 },
      { header: "热水用量(吨)", key: "hotWaterUsage", width: 16 },
      { header: "热水费(元)", key: "hotWaterCost", width: 12 },
      { header: "总金额(元)", key: "totalAmount", width: 14 },
      { header: "支付状态", key: "isPaid", width: 12 },
      { header: "备注", key: "notes", width: 25 },
    ];

    // 设置表头样式（加粗、背景色）
    recordsSheet.getRow(1).font = { bold: true };
    recordsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" }, // 浅灰色背景
    };
    recordsSheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // 添加数据行
    records.forEach((record) => {
      recordsSheet.addRow({
        yearMonth: record.yearMonth,
        electricityUsage: Number(record.electricityUsage.toFixed(2)),
        electricityCost: Number(record.electricityCost.toFixed(2)),
        coldWaterUsage: Number(record.coldWaterUsage.toFixed(2)),
        coldWaterCost: Number(record.coldWaterCost.toFixed(2)),
        hotWaterUsage: Number(record.hotWaterUsage.toFixed(2)),
        hotWaterCost: Number(record.hotWaterCost.toFixed(2)),
        totalAmount: Number(record.totalAmount.toFixed(2)),
        isPaid: record.isPaid ? "已支付" : "未支付",
        notes: record.notes || "",
      });
    });

    // 为数据行添加边框
    recordsSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // ========== 工作表2：统计汇总 ==========
    const statsSheet = workbook.addWorksheet("统计汇总");

    // 定义列
    statsSheet.columns = [
      { header: "统计项", key: "item", width: 25 },
      { header: "数值", key: "value", width: 18 },
    ];

    // 设置表头样式（加粗、背景色）
    statsSheet.getRow(1).font = { bold: true };
    statsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" }, // 浅灰色背景
    };
    statsSheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // 计算平均月度费用
    const avgMonthlyAmount =
      statistics.totalRecords > 0
        ? Number((statistics.totalAmount / statistics.totalRecords).toFixed(2))
        : 0;

    // 添加统计数据
    const statsData = [
      { item: "总记录数", value: statistics.totalRecords },
      { item: "已支付记录数", value: statistics.paidRecords },
      { item: "未支付记录数", value: statistics.unpaidRecords },
      { item: "总金额(元)", value: Number(statistics.totalAmount.toFixed(2)) },
      {
        item: "已支付金额(元)",
        value: Number(statistics.paidAmount.toFixed(2)),
      },
      {
        item: "未支付金额(元)",
        value: Number(statistics.unpaidAmount.toFixed(2)),
      },
      { item: "平均月度费用(元)", value: avgMonthlyAmount },
    ];

    statsData.forEach((data) => {
      statsSheet.addRow(data);
    });

    // 为数据行添加边框
    statsSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // ========== 生成文件并下载 ==========
    // 生成文件名：租金记录_YYYY-MM-DD.xlsx
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const fileName = `租金记录_${dateStr}.xlsx`;

    // 生成 Excel 文件的 Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 创建 Blob 并触发下载
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("导出 Excel 失败:", error);
    return { success: false, error: "导出失败，请重试" };
  }
}
