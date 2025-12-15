"use client";

import { Record } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import { formatYearMonthChinese } from "@/lib/date-utils";
import { togglePaidStatus } from "@/app/actions/records";
import { useRouter } from "next/navigation";
import { Edit, Check, X } from "lucide-react";

interface RecordsTableProps {
  records: Record[];
}

export function RecordsTable({ records }: RecordsTableProps) {
  const router = useRouter();

  const handleTogglePaid = async (id: number) => {
    await togglePaidStatus(id);
    router.refresh();
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>暂无记录</p>
        <p className="text-sm mt-2">点击上方按钮创建第一条记录</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>月份</TableHead>
            <TableHead className="text-right">用电量</TableHead>
            <TableHead className="text-right">冷水</TableHead>
            <TableHead className="text-right">热水</TableHead>
            <TableHead className="text-right">总金额</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                {formatYearMonthChinese(record.yearMonth)}
              </TableCell>
              <TableCell className="text-right">
                {record.electricityUsage} 度
              </TableCell>
              <TableCell className="text-right">
                {record.coldWaterUsage} 吨
              </TableCell>
              <TableCell className="text-right">
                {record.hotWaterUsage} 吨
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(record.totalAmount)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={record.isPaid ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => handleTogglePaid(record.id)}
                >
                  {record.isPaid ? (
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      已支付
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <X className="h-3 w-3" />
                      未支付
                    </span>
                  )}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/records/${record.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
