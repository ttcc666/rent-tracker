"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
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

interface CostTrendChartProps {
  records: Record[];
  monthlyRent: number;
}

export function CostTrendChart({ records, monthlyRent }: CostTrendChartProps) {
  // 准备图表数据（按时间正序排列，最多显示最近12个月）
  const chartData = records
    .slice(0, 12)
    .reverse()
    .map((record) => {
      const utilitiesCost = record.electricityCost + record.coldWaterCost + record.hotWaterCost;
      return {
        month: record.yearMonth,
        租金: monthlyRent,
        水电费: parseFloat(utilitiesCost.toFixed(2)),
        总费用: parseFloat(record.totalAmount.toFixed(2)),
      };
    });

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ¥{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>费用趋势</CardTitle>
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
        <CardTitle>费用趋势</CardTitle>
        <CardDescription>最近 {chartData.length} 个月的费用变化</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
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
              tickFormatter={(value) => `¥${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="租金"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="水电费"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="总费用"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
