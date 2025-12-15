"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportRecordsToExcel } from "@/lib/export-utils";
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
 * 导出按钮组件属性
 */
interface ExportButtonProps {
  records: Record[];
  statistics: Statistics;
}

/**
 * Excel 导出按钮组件
 */
export function ExportButton({ records, statistics }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * 处理导出点击事件
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // 调用导出函数（现在是异步的）
      const result = await exportRecordsToExcel(records, statistics);

      if (!result.success) {
        console.error("导出失败:", result.error);
        alert("导出失败，请重试");
      }
    } catch (error) {
      console.error("导出过程中发生错误:", error);
      alert("导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  // 如果没有记录，禁用按钮
  const disabled = records.length === 0 || isExporting;

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled}
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          导出中...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          导出Excel
        </>
      )}
    </Button>
  );
}
