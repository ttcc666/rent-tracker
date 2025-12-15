"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Record {
  id: number;
  yearMonth: string;
  electricityUsage: number;
  electricityCost: number;
  coldWaterUsage: number;
  coldWaterCost: number;
  hotWaterUsage: number;
  hotWaterCost: number;
  totalAmount: number;
  isPaid: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UsageComparisonChartProps {
  records: Record[];
}

export function UsageComparisonChart({ records }: UsageComparisonChartProps) {
  // 准备图表数据（按时间正序排列，最多显示最近12个月）
  const chartData = records
    .slice(0, 12)
    .reverse()
    .map((record) => ({
      month: record.yearMonth,
      电量: parseFloat(record.electricityUsage.toFixed(2)),
      冷水: parseFloat(record.coldWaterUsage.toFixed(2)),
      热水: parseFloat(record.hotWaterUsage.toFixed(2)),
    }));

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            let unit = "";
            if (entry.name === "电量") unit = " 度";
            else if (entry.name === "冷水" || entry.name === "热水") unit = " 吨";

            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value.toFixed(2)}{unit}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>用量对比</CardTitle>
          <CardDescription>暂无数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            暂无记录数据，请先创建记录
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>用量对比</CardTitle>
        <CardDescription>最近 {chartData.length} 个月的水电使用量</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="rect"
            />
            <Bar
              dataKey="电量"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="冷水"
              fill="#06b6d4"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="热水"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
