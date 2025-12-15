"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createRecord } from "@/app/actions/records";
import { getSettings } from "@/app/actions/settings";
import { getCurrentYearMonth } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/calculations";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRecordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<any>(null);

  // 表单数据
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [electricityUsage, setElectricityUsage] = useState("");
  const [coldWaterUsage, setColdWaterUsage] = useState("");
  const [hotWaterUsage, setHotWaterUsage] = useState("");
  const [note, setNote] = useState("");

  // 计算的费用
  const [electricityCost, setElectricityCost] = useState(0);
  const [coldWaterCost, setColdWaterCost] = useState(0);
  const [hotWaterCost, setHotWaterCost] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      const result = await getSettings();
      if (result.success && result.data) {
        setSettings(result.data);
      }
    };
    loadSettings();
  }, []);

  // 自动计算费用
  useEffect(() => {
    if (!settings) return;

    const elecUsage = parseFloat(electricityUsage) || 0;
    const coldUsage = parseFloat(coldWaterUsage) || 0;
    const hotUsage = parseFloat(hotWaterUsage) || 0;

    const elecCost = elecUsage * settings.electricityRate;
    const coldCost = coldUsage * settings.coldWaterRate;
    const hotCost = hotUsage * settings.hotWaterRate;
    const total = settings.monthlyRent + elecCost + coldCost + hotCost;

    setElectricityCost(elecCost);
    setColdWaterCost(coldCost);
    setHotWaterCost(hotCost);
    setTotalAmount(total);
  }, [electricityUsage, coldWaterUsage, hotWaterUsage, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createRecord({
        yearMonth,
        electricityUsage: parseFloat(electricityUsage),
        coldWaterUsage: parseFloat(coldWaterUsage),
        hotWaterUsage: parseFloat(hotWaterUsage),
        note: note || undefined,
      });

      if (result.success) {
        router.push("/records");
        router.refresh();
      } else {
        setError(result.error || "创建失败");
      }
    } catch (err) {
      setError("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 返回按钮 */}
      <Link href="/records">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
      </Link>

      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">新建记录</h1>
        <p className="text-muted-foreground mt-1">
          记录本月的水电使用量
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>选择月份并输入用量</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yearMonth">月份</Label>
              <Input
                id="yearMonth"
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="electricityUsage">用电量（度）</Label>
                <Input
                  id="electricityUsage"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={electricityUsage}
                  onChange={(e) => setElectricityUsage(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  单价：{formatCurrency(settings.electricityRate)}/度
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coldWaterUsage">冷水用量（吨）</Label>
                <Input
                  id="coldWaterUsage"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={coldWaterUsage}
                  onChange={(e) => setColdWaterUsage(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  单价：{formatCurrency(settings.coldWaterRate)}/吨
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotWaterUsage">热水用量（吨）</Label>
                <Input
                  id="hotWaterUsage"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={hotWaterUsage}
                  onChange={(e) => setHotWaterUsage(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  单价：{formatCurrency(settings.hotWaterRate)}/吨
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">备注（可选）</Label>
              <Input
                id="note"
                type="text"
                placeholder="添加备注信息"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* 费用明细 */}
        <Card>
          <CardHeader>
            <CardTitle>费用明细</CardTitle>
            <CardDescription>自动计算的费用</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">月租金</span>
              <span className="font-medium">{formatCurrency(settings.monthlyRent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">电费</span>
              <span className="font-medium">{formatCurrency(electricityCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">冷水费</span>
              <span className="font-medium">{formatCurrency(coldWaterCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">热水费</span>
              <span className="font-medium">{formatCurrency(hotWaterCost)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold">总计</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/records" className="flex-1">
            <Button type="button" variant="outline" className="w-full" disabled={loading}>
              取消
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "创建中..." : "创建记录"}
          </Button>
        </div>
      </form>
    </div>
  );
}
