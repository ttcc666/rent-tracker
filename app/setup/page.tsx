"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setupSystem } from "@/app/actions/auth";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 密码表单
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 租金设置表单
  const [monthlyRent, setMonthlyRent] = useState("");
  const [paymentDay, setPaymentDay] = useState("");
  const [deposit, setDeposit] = useState("");
  const [electricityRate, setElectricityRate] = useState("");
  const [coldWaterRate, setColdWaterRate] = useState("");
  const [hotWaterRate, setHotWaterRate] = useState("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("密码至少需要 6 位");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setStep(2);
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const settings = {
        monthlyRent: parseFloat(monthlyRent),
        paymentDay: parseInt(paymentDay),
        deposit: parseFloat(deposit),
        electricityRate: parseFloat(electricityRate),
        coldWaterRate: parseFloat(coldWaterRate),
        hotWaterRate: parseFloat(hotWaterRate),
      };

      // 验证数据
      if (settings.paymentDay < 1 || settings.paymentDay > 31) {
        setError("付款日必须在 1-31 之间");
        setLoading(false);
        return;
      }

      if (
        settings.monthlyRent < 0 ||
        settings.deposit < 0 ||
        settings.electricityRate < 0 ||
        settings.coldWaterRate < 0 ||
        settings.hotWaterRate < 0
      ) {
        setError("金额不能为负数");
        setLoading(false);
        return;
      }

      const result = await setupSystem(password, settings);

      if (result.success) {
        // 使用 window.location 强制刷新页面
        window.location.href = "/";
      } else {
        setError(result.error || "设置失败");
      }
    } catch (err) {
      setError("设置失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            欢迎使用租金跟踪系统
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? "步骤 1/2: 设置登录密码" : "步骤 2/2: 配置租金信息"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">设置密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="至少 6 位"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full">
                下一步
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">基本信息</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRent">月租金（元）</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      step="0.01"
                      placeholder="例如：2000"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentDay">付款日（每月几号）</Label>
                    <Input
                      id="paymentDay"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="例如：10"
                      value={paymentDay}
                      onChange={(e) => setPaymentDay(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit">押金（元）</Label>
                  <Input
                    id="deposit"
                    type="number"
                    step="0.01"
                    placeholder="例如：2000"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">单价设置</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="electricityRate">电费单价（元/度）</Label>
                    <Input
                      id="electricityRate"
                      type="number"
                      step="0.01"
                      placeholder="例如：0.6"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coldWaterRate">冷水单价（元/吨）</Label>
                    <Input
                      id="coldWaterRate"
                      type="number"
                      step="0.01"
                      placeholder="例如：3.5"
                      value={coldWaterRate}
                      onChange={(e) => setColdWaterRate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hotWaterRate">热水单价（元/吨）</Label>
                    <Input
                      id="hotWaterRate"
                      type="number"
                      step="0.01"
                      placeholder="例如：5.0"
                      value={hotWaterRate}
                      onChange={(e) => setHotWaterRate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  上一步
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "设置中..." : "完成设置"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
