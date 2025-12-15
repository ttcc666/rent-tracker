"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Check, X, AlertCircle, Settings, Bell } from "lucide-react";

import {
  getEmailConfig,
  getNotificationSettings,
  updateEmailConfig,
  updateNotificationSettings,
  updateUserEmail,
  testEmailConfig,
  getEmailServiceStatus,
} from "@/app/actions/email";
import { getSettings } from "@/app/actions/settings";
import { emailProviders, detectEmailProvider, autoFillSmtpConfig } from "@/lib/email-validation";

export default function EmailSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 服务状态
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // 用户邮箱
  const [userEmail, setUserEmail] = useState("");

  // SMTP 配置
  const [smtpConfig, setSmtpConfig] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpSecure: false,
    smtpUser: "",
    smtpPassword: "",
    fromName: "租金跟踪系统",
    fromEmail: "",
  });

  // 通知设置
  const [notificationSettings, setNotificationSettings] = useState({
    paymentReminderEnabled: true,
    paymentReminderDays: "3",
    overdueReminderEnabled: true,
    monthlyBillEnabled: true,
    systemNotificationEnabled: true,
  });

  // 当前选中的邮箱提供商
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [emailConfig, notificationConfig, status, settings] = await Promise.all([
          getEmailConfig(),
          getNotificationSettings(),
          getEmailServiceStatus(),
          getSettings(),
        ]);

        setServiceStatus(status);

        if (emailConfig) {
          setSmtpConfig({
            smtpHost: emailConfig.smtpHost,
            smtpPort: emailConfig.smtpPort.toString(),
            smtpSecure: emailConfig.smtpSecure,
            smtpUser: emailConfig.smtpUser,
            smtpPassword: emailConfig.smtpPassword,
            fromName: emailConfig.fromName,
            fromEmail: emailConfig.fromEmail,
          });
        }

        if (notificationConfig) {
          setNotificationSettings({
            paymentReminderEnabled: notificationConfig.paymentReminderEnabled,
            paymentReminderDays: notificationConfig.paymentReminderDays.toString(),
            overdueReminderEnabled: notificationConfig.overdueReminderEnabled,
            monthlyBillEnabled: notificationConfig.monthlyBillEnabled,
            systemNotificationEnabled: notificationConfig.systemNotificationEnabled,
          });
        }

        if (settings?.data?.email) {
          setUserEmail(settings.data.email);
        }

        // 自动检测邮箱提供商
        if (emailConfig?.smtpUser) {
          const detected = detectEmailProvider(emailConfig.smtpUser);
          if (detected) {
            setSelectedProvider(detected);
          }
        }
      } catch (err) {
        setError("加载设置失败");
      } finally {
        setStatusLoading(false);
      }
    };
    loadSettings();
  }, []);

  // 处理邮箱提供商选择
  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    if (provider && provider !== "custom") {
      const config = emailProviders[provider as keyof typeof emailProviders];
      setSmtpConfig(prev => ({
        ...prev,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort.toString(),
        smtpSecure: config.smtpSecure,
      }));
    }
  };

  // 处理SMTP用户名变化
  const handleSmtpUserChange = (value: string) => {
    setSmtpConfig(prev => ({ ...prev, smtpUser: value }));

    // 自动填充发件人邮箱
    if (!smtpConfig.fromEmail || smtpConfig.fromEmail === smtpConfig.smtpUser) {
      setSmtpConfig(prev => ({ ...prev, fromEmail: value }));
    }

    // 自动检测邮箱提供商
    const detected = detectEmailProvider(value);
    if (detected && detected !== selectedProvider) {
      setSelectedProvider(detected);
      handleProviderSelect(detected);
    }
  };

  // 测试邮件配置
  const handleTestConfig = async () => {
    setTestLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await testEmailConfig({
        ...smtpConfig,
        smtpPort: parseInt(smtpConfig.smtpPort),
        smtpSecure: Boolean(smtpConfig.smtpSecure),
      });
      if (result.success) {
        setSuccess("SMTP 配置测试成功");
      } else {
        setError(result.message || "配置测试失败");
      }
    } catch (err) {
      setError("测试失败，请检查网络连接");
    } finally {
      setTestLoading(false);
    }
  };

  // 发送测试邮件
  const handleSendTestEmail = async () => {
    setTestLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await testEmailConfig();
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message || "发送测试邮件失败");
      }
    } catch (err) {
      setError("发送失败，请检查配置");
    } finally {
      setTestLoading(false);
    }
  };

  // 保存邮件配置
  const handleSaveEmailConfig = async () => {
    setSaveLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateEmailConfig({
        ...smtpConfig,
        smtpPort: parseInt(smtpConfig.smtpPort),
        smtpSecure: Boolean(smtpConfig.smtpSecure),
      });

      if (result.success) {
        setSuccess("邮件配置保存成功");
        // 重新获取服务状态
        const status = await getEmailServiceStatus();
        setServiceStatus(status);
      } else {
        setError(result.error || "保存失败");
      }
    } catch (err) {
      setError("保存失败，请重试");
    } finally {
      setSaveLoading(false);
    }
  };

  // 保存通知设置
  const handleSaveNotificationSettings = async () => {
    setSaveLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateNotificationSettings({
        ...notificationSettings,
        paymentReminderDays: parseInt(notificationSettings.paymentReminderDays),
      });

      if (result.success) {
        setSuccess("通知设置保存成功");
      } else {
        setError(result.error || "保存失败");
      }
    } catch (err) {
      setError("保存失败，请重试");
    } finally {
      setSaveLoading(false);
    }
  };

  // 保存用户邮箱
  const handleSaveUserEmail = async () => {
    setSaveLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateUserEmail(userEmail);
      if (result.success) {
        setSuccess("用户邮箱保存成功");
      } else {
        setError(result.error || "保存失败");
      }
    } catch (err) {
      setError("保存失败，请重试");
    } finally {
      setSaveLoading(false);
    }
  };

  // 服务状态指示器
  const renderStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "secondary"} className="flex items-center gap-1">
        {status ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
        {label}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Mail className="w-8 h-8" />
          邮件设置
        </h1>
        <p className="text-muted-foreground mt-1">
          配置邮件服务和提醒功能
        </p>
      </div>

      {/* 服务状态 */}
      {!statusLoading && serviceStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              服务状态
            </CardTitle>
            <CardDescription>当前邮件服务的运行状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {renderStatusBadge(serviceStatus.hasConfig, "已配置")}
              {renderStatusBadge(serviceStatus.hasUserEmail, "用户邮箱")}
              {renderStatusBadge(serviceStatus.canConnect, "连接正常")}
              {renderStatusBadge(serviceStatus.isConfigured, "完整配置")}
            </div>
            {serviceStatus.error && (
              <Alert className="mt-3" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serviceStatus.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* 用户邮箱设置 */}
      <Card>
        <CardHeader>
          <CardTitle>用户邮箱</CardTitle>
          <CardDescription>设置接收提醒邮件的邮箱地址</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="userEmail">邮箱地址</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="your-email@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                disabled={saveLoading}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSaveUserEmail}
                disabled={saveLoading || !userEmail}
              >
                {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                保存邮箱
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP 配置 */}
      <Card>
        <CardHeader>
          <CardTitle>SMTP 配置</CardTitle>
          <CardDescription>配置邮件发送服务器</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 邮箱提供商选择 */}
          <div className="space-y-2">
            <Label>快速配置</Label>
            <Select value={selectedProvider} onValueChange={handleProviderSelect}>
              <SelectTrigger>
                <SelectValue placeholder="选择邮箱提供商或手动配置" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">手动配置</SelectItem>
                {Object.entries(emailProviders).map(([key, provider]) => (
                  <SelectItem key={key} value={key}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProvider && selectedProvider !== "custom" && (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                <p className="font-medium">{emailProviders[selectedProvider as keyof typeof emailProviders].name}</p>
                <p>{emailProviders[selectedProvider as keyof typeof emailProviders].description}</p>
                <p className="text-orange-600 mt-1">{emailProviders[selectedProvider as keyof typeof emailProviders].note}</p>
              </div>
            )}
          </div>

          {/* SMTP 设置表单 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP 服务器</Label>
              <Input
                id="smtpHost"
                placeholder="smtp.example.com"
                value={smtpConfig.smtpHost}
                onChange={(e) => setSmtpConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                disabled={saveLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPort">端口</Label>
              <Input
                id="smtpPort"
                type="number"
                placeholder="587"
                value={smtpConfig.smtpPort}
                onChange={(e) => setSmtpConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                disabled={saveLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUser">用户名</Label>
              <Input
                id="smtpUser"
                type="email"
                placeholder="your-email@example.com"
                value={smtpConfig.smtpUser}
                onChange={(e) => handleSmtpUserChange(e.target.value)}
                disabled={saveLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPassword">密码</Label>
              <Input
                id="smtpPassword"
                type="password"
                placeholder="邮箱密码或授权码"
                value={smtpConfig.smtpPassword}
                onChange={(e) => setSmtpConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                disabled={saveLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromName">发件人名称</Label>
              <Input
                id="fromName"
                placeholder="租金跟踪系统"
                value={smtpConfig.fromName}
                onChange={(e) => setSmtpConfig(prev => ({ ...prev, fromName: e.target.value }))}
                disabled={saveLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">发件人邮箱</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="noreply@example.com"
                value={smtpConfig.fromEmail}
                onChange={(e) => setSmtpConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                disabled={saveLoading}
              />
            </div>
          </div>

          {/* SSL 开关 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>使用 SSL/TLS</Label>
              <p className="text-sm text-muted-foreground">
                启用加密连接，通常端口为 465（SSL）或 587（TLS）
              </p>
            </div>
            <Switch
              checked={smtpConfig.smtpSecure}
              onCheckedChange={(checked) => setSmtpConfig(prev => ({ ...prev, smtpSecure: checked }))}
              disabled={saveLoading}
            />
          </div>

          {/* 测试和保存按钮 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleTestConfig}
              disabled={testLoading || saveLoading}
            >
              {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              测试连接
            </Button>
            <Button
              variant="outline"
              onClick={handleSendTestEmail}
              disabled={testLoading || saveLoading || !userEmail}
            >
              {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              发送测试邮件
            </Button>
            <Button
              onClick={handleSaveEmailConfig}
              disabled={saveLoading}
            >
              {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              保存配置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            通知设置
          </CardTitle>
          <CardDescription>配置自动邮件提醒功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>付款提醒</Label>
                <p className="text-sm text-muted-foreground">
                  在付款日前发送提醒邮件
                </p>
              </div>
              <Switch
                checked={notificationSettings.paymentReminderEnabled}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, paymentReminderEnabled: checked }))}
                disabled={saveLoading}
              />
            </div>

            {notificationSettings.paymentReminderEnabled && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="reminderDays">提前天数</Label>
                <Select
                  value={notificationSettings.paymentReminderDays}
                  onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, paymentReminderDays: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 7, 10, 15].map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day} 天
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>逾期提醒</Label>
                <p className="text-sm text-muted-foreground">
                  付款日后发送逾期提醒
                </p>
              </div>
              <Switch
                checked={notificationSettings.overdueReminderEnabled}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, overdueReminderEnabled: checked }))}
                disabled={saveLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>月度账单</Label>
                <p className="text-sm text-muted-foreground">
                  每月发送费用明细账单
                </p>
              </div>
              <Switch
                checked={notificationSettings.monthlyBillEnabled}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, monthlyBillEnabled: checked }))}
                disabled={saveLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>系统通知</Label>
                <p className="text-sm text-muted-foreground">
                  发送系统重要更新通知
                </p>
              </div>
              <Switch
                checked={notificationSettings.systemNotificationEnabled}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemNotificationEnabled: checked }))}
                disabled={saveLoading}
              />
            </div>
          </div>

          <Button
            onClick={handleSaveNotificationSettings}
            disabled={saveLoading}
          >
            {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            保存通知设置
          </Button>
        </CardContent>
      </Card>

      {/* 错误和成功提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}