"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettings, updateSettings } from "@/app/actions/settings";
import { changePassword } from "@/app/actions/auth";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // 租金设置表单
  const [monthlyRent, setMonthlyRent] = useState("");
  const [paymentDay, setPaymentDay] = useState("");
  const [deposit, setDeposit] = useState("");
  const [electricityRate, setElectricityRate] = useState("");
  const [coldWaterRate, setColdWaterRate] = useState("");
  const [hotWaterRate, setHotWaterRate] = useState("");

  // 密码修改表单
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      const result = await getSettings();
      if (result.success && result.data) {
        const s = result.data;
        setMonthlyRent(s.monthlyRent.toString());
        setPaymentDay(s.paymentDay.toString());
        setDeposit(s.deposit.toString());
        setElectricityRate(s.electricityRate.toString());
        setColdWaterRate(s.coldWaterRate.toString());
        setHotWaterRate(s.hotWaterRate.toString());
      }
    };
    loadSettings();
  }, []);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await updateSettings({
        monthlyRent: parseFloat(monthlyRent),
        paymentDay: parseInt(paymentDay),
        deposit: parseFloat(deposit),
        electricityRate: parseFloat(electricityRate),
        coldWaterRate: parseFloat(coldWaterRate),
        hotWaterRate: parseFloat(hotWaterRate),
      });

      if (result.success) {
        setSuccess("设置已更新");
        router.refresh();
      } else {
        setError(result.error || "更新失败");
      }
    } catch (err) {
      setError("更新失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("新密码至少需要 6 位");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("两次输入的新密码不一致");
      return;
    }

    setPasswordLoading(true);

    try {
      const result = await changePassword(oldPassword, newPassword);

      if (result.success) {
        setPasswordSuccess("密码已更新");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setPasswordError(result.error || "修改失败");
      }
    } catch (err) {
      setPasswordError("修改失败，请重试");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">设置</h1>
        <p className="text-muted-foreground mt-1">
          管理租金配置和账户设置
        </p>
      </div>

      {/* 租金设置 */}
      <form onSubmit={handleSettingsSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>租金设置</CardTitle>
            <CardDescription>修改月租金和水电费单价</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">基本信息</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">月租金（元）</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    step="0.01"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDay">付款日（每月几号）</Label>
                  <Input
                    id="paymentDay"
                    type="number"
                    min="1"
                    max="31"
                    value={paymentDay}
                    onChange={(e) => setPaymentDay(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit">押金（元）</Label>
                <Input
                  id="deposit"
                  type="number"
                  step="0.01"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">单价设置</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="electricityRate">电费单价（元/度）</Label>
                  <Input
                    id="electricityRate"
                    type="number"
                    step="0.01"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coldWaterRate">冷水单价（元/吨）</Label>
                  <Input
                    id="coldWaterRate"
                    type="number"
                    step="0.01"
                    value={coldWaterRate}
                    onChange={(e) => setColdWaterRate(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hotWaterRate">热水单价（元/吨）</Label>
                  <Input
                    id="hotWaterRate"
                    type="number"
                    step="0.01"
                    value={hotWaterRate}
                    onChange={(e) => setHotWaterRate(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存设置"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* 修改密码 */}
      <form onSubmit={handlePasswordSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>更改您的登录密码</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">原密码</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="至少 6 位"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">确认新密码</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="再次输入新密码"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>

            {passwordError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {passwordSuccess}
              </div>
            )}

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? "修改中..." : "修改密码"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
